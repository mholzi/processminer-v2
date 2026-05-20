# Architecture

This document is the cold-start reading guide for someone reviewing the Processminer codebase. It
explains what the system does, how its parts fit together, and where to look. If you only have an
hour, read [§1](#1-60-second-summary), [§4](#4-end-to-end-a-walkthrough-of-one-flow), and
[§10](#10-reading-order-if-you-have-2-hours-2-days-or-2-weeks).

## Table of contents

1. [60-second summary](#1-60-second-summary)
2. [The problem this solves](#2-the-problem-this-solves)
3. [The four runtimes and how they fit](#3-the-four-runtimes-and-how-they-fit)
4. [End-to-end: a walkthrough of one flow](#4-end-to-end-a-walkthrough-of-one-flow)
5. [Data model](#5-data-model)
6. [Invariants — the things that must not break](#6-invariants--the-things-that-must-not-break)
7. [The skill catalogue](#7-the-skill-catalogue)
8. [The Python writer toolkit](#8-the-python-writer-toolkit)
9. [Testing](#9-testing)
10. [Reading order — if you have 2 hours, 2 days, or 2 weeks](#10-reading-order-if-you-have-2-hours-2-days-or-2-weeks)
11. [Known tradeoffs and debt](#11-known-tradeoffs-and-debt)
12. [Glossary](#12-glossary)

---

## 1. 60-second summary

Processminer is a tool for documenting business processes through SME interviews driven by Claude
Code skills. It applies [Karpathy's LLM Wiki pattern][karpathy]: raw uploaded documents stay
immutable under `raw-sources/`, an LLM-elaborated typed Markdown wiki lives under
`wiki/processes/<slug>/`, and a schema-driven Python toolkit under `scripts/wiki/` performs every
mutation. The Next.js app under `src/` displays the wiki and hosts the chat panel that drives the
skills.

Three things are unusual:

1. **The LLM never edits Markdown directly.** It emits JSON specs that schema-validated Python
   scripts write to disk. The model owns judgement; the scripts own format.
2. **Provenance is per heading.** Each template heading in every element carries
   `{source: elicited|document|proposed|web|legacy-approved, evidence: "<verbatim quote>"}`. The
   approval gate blocks elements with any `proposed` heading from being approved.
3. **Skills run in the user's local Claude Code CLI.** The web app spawns `claude` as a
   subprocess (warm-pooled, streaming-input mode). No hosted API, no API key, no
   embedding/retrieval. The CLI agent reads/writes the same filesystem the app renders.

The codebase is ≈ 2,500 LOC of TypeScript (app + lib), ≈ 4,000 LOC of Python (28 scripts), 21
SKILL.md files (~12k lines of agent instructions), and a 2,200-line `process-schema.json` that is
the single source of truth for element types, sections, frontmatter and provenance rules.

[karpathy]: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

---

## 2. The problem this solves

A bank (or any regulated organisation) needs to document its processes — as-is mechanics, the
risk and compliance picture, the client experience, innovation opportunities, IT systems
landscape, and a target state. Subject matter experts hold most of the knowledge in their heads;
some lives in patchy uploaded documents.

The naïve LLM approach — "ask the SME, let GPT write it up" — fails because the LLM inflates a
thin SME comment into a confident detailed paragraph. The SME reads the tidy draft, it looks
right, and they approve it. The made-up part rides in on the back of the real part. See
[HALLUCINATION-PLAN.md](HALLUCINATION-PLAN.md) for the framing.

Processminer's countermeasures:

| Risk | Countermeasure | Where |
|---|---|---|
| LLM invents prose the SME never said | Per-heading provenance with verbatim evidence quotes | [schema/process-schema.json:2122](schema/process-schema.json), [src/lib/conformance.ts](src/lib/conformance.ts) |
| Approved element silently re-broken by an edit | Edit auto-flips heading to `proposed`; approval is gated | [scripts/wiki/patch_element.py](scripts/wiki/patch_element.py), [set_approval.py](scripts/wiki/set_approval.py) |
| LLM emits malformed Markdown | LLM emits JSON spec; Python writes the file from the schema template | [write_element.py](scripts/wiki/write_element.py) |
| Cross-section inconsistencies | `run-lint` skill does a five-lens sweep, re-opens implicated approvals | [.claude/skills/run-lint/SKILL.md](.claude/skills/run-lint/SKILL.md), [apply_lint.py](scripts/wiki/apply_lint.py) |
| Re-ingest of an updated document contradicts wiki | Conflict-resolution flow walks SME through each disagreement | [.claude/skills/conflict-resolution/SKILL.md](.claude/skills/conflict-resolution/SKILL.md), `conflicts.json` sidecar |
| LLM hallucinates a cross-reference | Relations are single-source-of-truth forward fields; reverse views derived | [src/lib/relations.ts](src/lib/relations.ts) |

---

## 3. The four runtimes and how they fit

Four things execute in this system. Understanding which is which is the key to reviewing it.

```
┌──────────────────────────────────────────────────────────────────────┐
│ BROWSER                                                              │
│  Next.js client components: chat panel, document canvas, side nav    │
└─────────────────────┬────────────────────────────────────────────────┘
                      │ HTTP + SSE
┌─────────────────────▼────────────────────────────────────────────────┐
│ NEXT.JS SERVER (Node, port 3000)                                     │
│  src/app/                                                            │
│   ├── page.tsx           reads wiki via src/lib/wiki.ts              │
│   ├── api/session/       POST → spawns / talks to a SessionWorker    │
│   └── api/{upload,       writes raw-sources/, feedback/, lint/       │
│       feedback,…}/         findings notes — small file-IO endpoints  │
│                                                                      │
│  src/lib/session-worker.ts ─── pool of long-lived `claude` CLI ──┐   │
│  src/lib/wiki.ts            reads wiki/ + schema at request time │   │
└──────────────────────────────────────────────────────────────────│───┘
                                                                   │
┌──────────────────────────────────────────────────────────────────▼───┐
│ CLAUDE CODE CLI (subprocess, --input-format stream-json)             │
│  Discovers .claude/skills/, runs the agent loop, has filesystem      │
│  tools (Read/Write/Bash/Edit). When a SKILL.md tells it to write     │
│  an element, it shells out to a Python script:                       │
│                                                                      │
│         Skill ──Bash──▶ python3 scripts/wiki/write_element.py spec   │
└─────────────────────────────────────┬────────────────────────────────┘
                                      │ stdout JSON
┌─────────────────────────────────────▼────────────────────────────────┐
│ PYTHON WRITER TOOLKIT (scripts/wiki/*.py)                            │
│  Schema-validated, deterministic. Reads schema/process-schema.json,  │
│  writes wiki/processes/<slug>/<section>/<ELEMENT>.md, returns the    │
│  assigned id and conformance status as JSON.                         │
└─────────────────────────────────────┬────────────────────────────────┘
                                      │
                                      ▼
                            ┌──────────────────┐
                            │ FILE SYSTEM      │
                            │  wiki/           │
                            │  raw-sources/    │
                            │  schema/         │
                            │  feedback/       │
                            └──────────────────┘
                            (Single source of truth.
                             Next.js re-reads on every
                             request via dynamic=force-dynamic.)
```

### Why the warm-worker pool

Cold-starting the `claude` CLI per chat turn means paying Node boot + ~20 SKILL.md discovery +
MCP init + auth (~6 s). [`src/lib/session-worker.ts`](src/lib/session-worker.ts) keeps `claude`
processes alive in `--input-format stream-json` mode and pipes each user turn to stdin. Pool
size, idle TTL and turn timeout are env-tunable:

| Env var | Default | Purpose |
|---|---|---|
| `SESSION_MAX_WORKERS` | 6 | Cap on concurrent warm workers |
| `SESSION_IDLE_TTL_MS` | 1,800,000 (30 min) | Evict idle workers |
| `SESSION_TURN_TIMEOUT_MS` | 1,800,000 (30 min) | One-turn ceiling |
| `SESSION_MODEL` | `claude-sonnet-4-6` | Model passed to `--model` |

Resumption: if a known sessionId comes in after its worker has been evicted, the route spawns a
fresh worker with `--resume <id>`.

### Why there's no embedding/RAG

The CLI agent has Read/Grep/Write tools. It reads the wiki directly when it needs to. The wiki
is small enough (10² – 10³ elements) and structured enough (typed, named files) that grep on
disk is faster and more honest than vector search. This is exactly Karpathy's wiki argument.

### What the Next.js app actually does

- **Render the wiki** ([`src/lib/wiki.ts`](src/lib/wiki.ts) reads files; the page renders).
- **Drive skills via chat** ([`/api/session`](src/app/api/session/route.ts) posts to the
  session worker; SSE streams the response).
- **Small file-IO endpoints** for things that don't need an LLM: upload a source document,
  toggle a finding dismissal, save app feedback.
- **Trigger skills via buttons** — buttons post a fixed prompt to `/api/session` (see
  [SKILLS.md §11](SKILLS.md)).

It does **not**: hold state in a database, do RAG, run a job queue, authenticate users beyond a
name-and-role gate.

---

## 4. End-to-end: a walkthrough of one flow

Concrete example: SME uploads a Detailed Process Document and lands on the triage screen.

```
Browser                          Next.js                        Claude CLI                  Python
───────                          ───────                        ──────────                  ──────
1. drag-drop PDF
   ──▶ POST /api/upload  ──▶ writes file to
                              raw-sources/<slug>/
                              ◀── 200
2. click "Ingest"
   ──▶ POST /api/session  ──▶ sessionPool.getOrCreate(sessionId)
       {prompt: "ingest the
        file <slug>/foo.md"}    │
                                ├── stdin: {"type":"user",…}
                                │   ──────────────────────▶ matches description of
                                │                            /document-ingest skill,
                                │                            loads SKILL.md
                                │
                                │                            Step 1: Read source doc
                                │                            (Read tool)
                                │
                                │                            Step 2: Extract entities
                                │                            (model reasoning)
                                │
                                │                            Step 3: For each draft
                                │                            element, shell out to:
                                │                            Bash: python3
                                │                            scripts/wiki/write_element.py
                                │                            ─────────────────────────▶ load schema,
                                │                                                       validate spec,
                                │                                                       assign id via
                                │                                                       next_id.py,
                                │                                                       write
                                │                                                       wiki/.../PS-XX-001.md
                                │                            ◀──────────────────────── stdout:
                                │                                                       {"id":"PS-XX-001",
                                │                                                        "conforms":true}
                                │
                                │                            Step 4: write_ingest_report.py
                                │                            ──────────────────────────▶ wiki/.../ingest.json
                                │
                                │                            Step 5: emit final summary
                                │   ◀── stdout: {"type":"assistant",…}
                                │   ◀── stdout: {"type":"result",…}
                                │
       ◀── SSE: chunk events stream
3. router.refresh()
   ──▶ GET /          ──▶ src/lib/wiki.ts reads
                          wiki/processes/<slug>/
                          ◀── re-rendered page with
                              new elements visible
```

Concrete files involved in that flow:

| Step | File |
|---|---|
| Upload endpoint | [src/app/api/upload/route.ts](src/app/api/upload/route.ts) |
| Session endpoint | [src/app/api/session/route.ts](src/app/api/session/route.ts) |
| Worker pool | [src/lib/session-worker.ts](src/lib/session-worker.ts) |
| Skill instructions | [.claude/skills/document-ingest/SKILL.md](.claude/skills/document-ingest/SKILL.md) |
| Element writer | [scripts/wiki/write_element.py](scripts/wiki/write_element.py) |
| ID allocator | [scripts/wiki/next_id.py](scripts/wiki/next_id.py) |
| Conformance gate | [scripts/wiki/check_conformance.py](scripts/wiki/check_conformance.py) |
| Ingest report writer | [scripts/wiki/write_ingest_report.py](scripts/wiki/write_ingest_report.py) |
| Re-render | [src/lib/wiki.ts](src/lib/wiki.ts), [src/app/page.tsx](src/app/page.tsx) (`dynamic = "force-dynamic"`) |

---

## 5. Data model

### The schema layer

[`schema/process-schema.json`](schema/process-schema.json) (v2.3.0, ~2,200 lines) is the single
source of truth for:

- **6 areas**, each with an ordered list of **sections** (32 sections total).
- **32 element types**, each with: `idPrefix`, an owning `section`, an `idMode`
  (per-process / global), required frontmatter `fields`, typed `relations`, and a named-block
  `template` (the headings the element body must carry).
- **11 relation types** with allowed source/target type sets — enforces e.g. `process-step` →
  `systems[]` may point only at `system` elements.
- **`fieldValues`** — enumerations for `approval`, `status`, `confidence`, `relevance`,
  `provenanceSource`, etc.
- **The provenance contract** (`_provenanceComment`) — for every template heading, the element
  carries `provenance.<heading> = {source, evidence}`. `check_conformance.py` cross-checks
  template headings against the provenance map and requires non-empty evidence for `elicited`,
  `document` and `web`.

### The wiki layer

Each process is a folder under `wiki/processes/<slug>/`. One folder per section, one Markdown
file per element:

```
wiki/processes/cob-003/
├── index.md                            process overview (frontmatter + prose)
├── sections.json                       per-section status (worked / confirmed-empty / not-visited)
├── glossary.json                       per-process glossary (sidecar, not an element type)
├── ingest.json                         last document-ingest report
├── lint.json                           last run-lint findings
├── conflicts.json                      open re-ingest conflicts (if any)
├── run-manifest.json                   counted-run tracker (reset by reset_manifest.py)
├── qer-state.json                      qer-session cursor (if interactive session active)
├── review-state.json                   foundational-run cursor (if running)
├── summaries.json                      per-area executive memos
├── target-review.json                  per-area target-state coverage
├── comments.json                       per-element discussion threads
├── process-steps/
│   ├── PS-COB-001.md
│   ├── PS-COB-002.md
│   └── …
├── controls/
│   ├── CP-COB-001.md
│   └── …
└── (one folder per section, ~32 folders)
```

Each element file is `--- <YAML frontmatter> --- \n <named-block body>`. Frontmatter is parsed
by a minimal in-house parser in [`src/lib/wiki.ts`](src/lib/wiki.ts) — not a full YAML parser;
the schema constrains what's valid.

### The raw-sources layer

`raw-sources/<slug>/` holds the immutable original documents (DTPs, memos, transcripts).
Recorded by `add_source.py` into `index.md`. Never modified by the system.

### The relations system

[`src/lib/relations.ts`](src/lib/relations.ts) (65 lines) defines the rule: **every relation is
stored as a forward field on one side; reverse views are derived.** E.g. `control.regulatedBy:
[REG-FR-014]` is canonical; the regulation's "Controls that satisfy this" view is computed by
scanning controls. Two pre-2026-05-19 violations of this rule (`regulation.controls` and
`system.steps`) were migrated out by `migrate_regulatedby.py` (the migration is preserved as a
test fixture). Read this file before touching anything that crosses element types.

---

## 6. Invariants — the things that must not break

These are the rules the rest of the system depends on. Most of the test suite exists to enforce
them.

| # | Invariant | Enforced by |
|---|---|---|
| 1 | Every template heading has a provenance entry; provenance keys match body headings exactly | [`check_conformance.py`](scripts/wiki/check_conformance.py) |
| 2 | Approval is blocked while any heading is `proposed` or `web` (unconfirmed) | [`set_approval.py`](scripts/wiki/set_approval.py) |
| 3 | Editing a heading body auto-flips its provenance source to `proposed` | [`patch_element.py`](scripts/wiki/patch_element.py) |
| 4 | A `run-lint` finding that implicates an approved element re-opens it to `in-progress` | [`apply_lint.py`](scripts/wiki/apply_lint.py) |
| 5 | Element ids are assigned by `next_id.py` in creation order — skills must never speak an id before allocation | [SKILLS.md §6](SKILLS.md) |
| 6 | Cross-references are forward-only; reverse views are derived | [`src/lib/relations.ts`](src/lib/relations.ts) |
| 7 | Verbatim cross-skill blocks (provenance block, element-writing procedure, batching rule) must stay byte-identical across SKILL.md files | [`scripts/check_skill_blocks.py`](scripts/check_skill_blocks.py) — run by the test suite |
| 8 | The TS conformance mirror (`src/lib/conformance.ts`) must agree with the Python (`check_conformance.py`) — verdicts diverging would make the UI lie | a parity test in `test_wiki_scripts.py` |
| 9 | Re-ingesting a document that contradicts the wiki must surface a conflict, never silently overwrite | [`document-ingest` SKILL.md](.claude/skills/document-ingest/SKILL.md), `conflicts.json` |

If you change any of {schema, write_element, patch_element, set_approval, conformance.ts}, run
`npm test` — these invariants are exactly what the test suite covers.

---

## 7. The skill catalogue

21 skills under `.claude/skills/`. Categorized:

| Kind | Skills |
|---|---|
| **Perspective specialists** (interactive) | `process-specialist`, `control-compliance-specialist`, `client-journey-specialist`, `innovation-analyst`, `transformation-agent`, `it-architect` |
| **Orchestrators** | `qer-session` (end-to-end documentation session, authored step sequence), `foundational-run` (post-ingest narrated walk), `council-review` (cross-perspective lint review) |
| **Web sourcing** (non-interactive) | `source-cx`, `source-innovation`, `source-regulation`, `source-target` |
| **Document workflow** | `new-process` (scaffold), `document-ingest` (extract + verify), `conflict-resolution` (re-ingest conflicts) |
| **Quality** | `run-lint` (5-lens sweep), `comment-review` (work an element's discussion), `area-summary` (per-area memo) |
| **Single-element** | `add-entry` (add one element via SME) |
| **Test harness** | `dogfood-run` (drives the running app through a full elaboration; only used by `/dogfood-run`) |

Each skill is a single `SKILL.md` with: domain knowledge, question bank, the
brainstorm/author/verify pattern, and the slice of the schema it owns. Read [SKILLS.md](SKILLS.md)
for the full architecture.

---

## 8. The Python writer toolkit

[`scripts/wiki/`](scripts/wiki/) is 28 Python scripts, no external dependencies (stdlib only).
The principle: **judgement is the model's; mechanics are deterministic Python.**

The model emits JSON specs over Bash; the scripts validate against the schema and write the
files. This means:

- The LLM can never produce malformed frontmatter or off-template body blocks — the script
  refuses.
- Two skill runs that produce the same spec produce byte-identical files.
- A reviewer can read `write_element.py` once and know how every element gets written.

The shared library is [`wiki_lib.py`](scripts/wiki/wiki_lib.py) (paths, frontmatter parse,
schema load).

Categorized:

| Purpose | Scripts |
|---|---|
| Setup | `scaffold_process.py`, `derive_process_meta.py`, `write_overview.py`, `add_source.py` |
| Writing | `write_element.py`, `write_elements.py` (batch), `patch_element.py`, `write_glossary.py`, `write_summary.py`, `write_target_review.py`, `write_ingest_report.py` |
| Schema utilities | `show_template.py`, `next_id.py` |
| Validation | `check_conformance.py`, `check_transitions.py`, `check_evidence.py` |
| Approval / lint | `set_approval.py`, `apply_lint.py`, `resolve_finding.py`, `clear_conflicts.py` |
| Cursors | `qer_cursor.py` (QER session), `review_cursor.py` (foundational-run) |
| Reporting | `source_report.py`, `idea_coverage.py`, `notes.py`, `reset_manifest.py`, `set_section_status.py`, `verbatim.py` |
| Migration | `migrate_grandfather.py` (kept as test fixture; one-off pass) |
| Tests | `test_wiki_scripts.py` (the wiki test suite, exercises every writer + the invariants) |

---

## 9. Testing

Three test suites:

| Command | What it does | Notes |
|---|---|---|
| `npm run typecheck` | `tsc --noEmit` over `src/` | No type errors allowed |
| `npm test` | `test:lint` + `test:scripts` | Real tests |
| `npm run eval:read-back` | Read-back / anti-hallucination eval | Optional, graded |

### `npm test` breakdown

- **`test:lint`** — [`src/lib/lint.test.ts`](src/lib/lint.test.ts) — node:test, exercises the
  TS-side lint helpers.
- **`test:scripts`** — [`scripts/wiki/test_wiki_scripts.py`](scripts/wiki/test_wiki_scripts.py)
  — a self-contained Python test runner that scaffolds a fresh `wiki/processes/self-test/`
  process and exercises every script: write_element, patch_element, set_approval (and its
  provenance gate), check_conformance (and its key-mismatch detection), migrate_grandfather
  (regression), `check_skill_blocks` (verbatim-block parity across SKILLs), and conformance
  TS↔Python parity. Cleans up after itself. **This is the most load-bearing test in the
  repo** — start here if you want to understand what the invariants in [§6](#6-invariants--the-things-that-must-not-break)
  mean operationally.

### `eval:read-back`

[`eval/read-back/`](eval/read-back/) is a graded fixture set: SME says a thin thing, the
specialist drafts an element, the eval asserts the AI surfaced its additions in the read-back
block. Covers the anti-hallucination block in all 6 specialist SKILLs. Without it the provenance
machinery is unverifiable.

### What's **not** tested

- The Next.js components — no Jest/Vitest/Playwright. UI verified by the `dogfood-run` skill
  which drives the running app through a full process elaboration end-to-end. See
  [`.claude/skills/dogfood-run/SKILL.md`](.claude/skills/dogfood-run/SKILL.md).
- The session-worker pool — exercised in dev but not unit-tested.
- The api/* endpoints — exercised by the dogfood run.

---

## 10. Reading order — if you have 2 hours, 2 days, or 2 weeks

### 2 hours — "I just need to understand the shape"

1. This document, §1–§4
2. [`README.md`](README.md) — the public face
3. [`SKILLS.md`](SKILLS.md) §1–§3, §7–§8 — agent architecture
4. [`schema/process-schema.json`](schema/process-schema.json) — open it, skim the `areas` and
   `elementTypes` arrays
5. [`src/lib/wiki.ts`](src/lib/wiki.ts) — how the app reads the wiki (367 lines)
6. [`src/app/api/session/route.ts`](src/app/api/session/route.ts) — how the app drives the
   skills (227 lines)
7. [`scripts/wiki/write_element.py`](scripts/wiki/write_element.py) — the canonical writer

### 2 days — "I'm doing a real review"

Add to the 2-hour list:

1. [`HALLUCINATION-PLAN.md`](HALLUCINATION-PLAN.md) — the provenance design, in full
2. [`CONTENT-MODEL-PLAN.md`](CONTENT-MODEL-PLAN.md) — the schema-extension decisions (D1–D6)
3. [`src/lib/session-worker.ts`](src/lib/session-worker.ts) — the warm-pool implementation (265 lines)
4. [`src/lib/conformance.ts`](src/lib/conformance.ts) — the TS provenance mirror
5. [`src/lib/relations.ts`](src/lib/relations.ts) — the single-source-of-truth rule
6. [`scripts/wiki/check_conformance.py`](scripts/wiki/check_conformance.py) — the
   provenance/template gate
7. [`scripts/wiki/set_approval.py`](scripts/wiki/set_approval.py) — the approval gate
8. [`scripts/wiki/patch_element.py`](scripts/wiki/patch_element.py) — the auto-flip behaviour
9. [`scripts/wiki/test_wiki_scripts.py`](scripts/wiki/test_wiki_scripts.py) — the invariants
   in test form
10. One specialist SKILL.md end-to-end —
    [`.claude/skills/process-specialist/SKILL.md`](.claude/skills/process-specialist/SKILL.md)
    is the most canonical
11. [`.claude/skills/document-ingest/SKILL.md`](.claude/skills/document-ingest/SKILL.md) and
    [`.claude/skills/foundational-run/SKILL.md`](.claude/skills/foundational-run/SKILL.md)
    — the two flows that produce most of a wiki

### 2 weeks — "I'm going to contribute / extend"

Add:

1. Every SKILL.md (~12k lines total)
2. Every Python writer
3. [`src/app/ProcessDocScreen.tsx`](src/app/ProcessDocScreen.tsx) — the main view (1,800 LOC)
4. [`src/components/AgentChat.tsx`](src/components/AgentChat.tsx) — the chat panel
5. [`DESIGN.md`](DESIGN.md) — the design system if you'll touch UI
6. One full demo: clone, `node scripts/seed-cob-003.mjs`, `npm run dev`, run
   `/foundational-run` against the seeded process end-to-end.

---

## 11. Known tradeoffs and debt

Honest list.

| # | Item | Tradeoff |
|---|---|---|
| 1 | **No database.** Everything is files. | Wins: trivial inspection, git diff is the audit log, no migration system. Loses: no concurrent-writer story; if two SMEs run sessions simultaneously, last-write-wins per element. |
| 2 | **Skills are Markdown, not code.** | Wins: easy to edit, models read them natively. Loses: no static checking; the only guard against drift is `check_skill_blocks.py` for the verbatim cross-skill spans. |
| 3 | **Long-running ingest is a single HTTP request** (30-min timeout). | Wins: simple. Loses: refresh = lose the run. A real production version needs a job queue. Flagged in [SKILLS.md §14](SKILLS.md). |
| 4 | **No auth beyond name + role.** | The app is local-only. Auth would matter if hosted. |
| 5 | **`hot.md` / `log.md` session cache (Karpathy + agricidaniel)** — not implemented. | Per-process session-state lives in structured JSON sidecars (`qer-state.json`, `run-manifest.json`) instead of a single 500-word human-skimmable brief. Flagged in [TODOS.md](TODOS.md). |
| 6 | **No retry on API/CLI failures** in the session worker; a turn that errors out surfaces the error to the user, who can retry. | The model decides whether the retry is safe — better than blind retries on a writing tool. |
| 7 | **The schema is the source of truth, but it's a 2,200-line JSON file** — there's no schema linter for the schema itself. | A `schema.test.ts` that validates schema-internal invariants (relation targets exist, idPrefix uniqueness, section-id integrity) would be cheap and worthwhile. |
| 8 | **Wiki Assistant** (grounded Q&A over the wiki) is planned but not built. | The app is currently authoring-first; reading-first is a separate skill. |
| 9 | **"AI edit" button** in the element card is stubbed. | Either wire to `/api/session` or remove. |
| 10 | **The TS↔Python conformance mirror** has to be kept in sync by hand (with the parity test catching drift). | Code generation from the schema would be cleaner; not yet justified. |

---

## 12. Glossary

| Term | Meaning |
|---|---|
| **Element** | One typed Markdown file in the wiki — e.g. a process-step, a control, a role |
| **Section** | A folder of elements of one type (mostly) — e.g. `process-steps/` |
| **Area** | A group of sections by perspective — As-Is, Risk & Compliance, Client Experience, Innovation, Target, IT Architecture |
| **Specialist** | A SKILL.md that owns one area's elicitation |
| **Provenance** | Per-heading `{source, evidence}` map in element frontmatter |
| **Approval** | Per-element `in-progress` / `approved` / `rejected` (or `relevance` for triaged element types) |
| **Conformance** | Schema-template + provenance check, run by `check_conformance.py` and mirrored in `src/lib/conformance.ts` |
| **Lint** | The cross-section sweep — `run-lint` skill + `apply_lint.py` |
| **Triage screen** | The post-ingest landing page that launches the foundational run |
| **Foundational run** | Narrated, resumable walk where the Process Analyst challenges every current-state element with the SME |
| **QER session** | The end-to-end interactive multi-perspective session (`qer-session` skill) |
| **Read-back** | The "you told me X; I also wrote Y, Z that you did not say — true or cut?" block, byte-identical in all six specialist SKILLs |
| **Session worker** | One long-lived `claude` CLI subprocess that holds one conversation, pooled in `src/lib/session-worker.ts` |
| **Sidecar JSON** | Per-process JSON files alongside the Markdown — `lint.json`, `ingest.json`, `sections.json`, etc. |
| **DTP** | Detailed Process Document — the most common kind of uploaded source |
| **RACI** | Responsible / Accountable / Consulted / Informed — per-step role assignment |
| **BMAD** | The agent-design family this project was ported from (see [SKILLS.md §13](SKILLS.md)) |

# Processminer

> AI-native process documentation. Claude Code skills elicit a subject-matter
> expert's process knowledge through interactive brainstorming, write it into a
> file-backed wiki, and develop it into a target state.

Processminer applies [Karpathy's LLM Wiki pattern][karpathy] to process
documentation: raw uploaded sources are immutable, a typed Markdown wiki is
incrementally elaborated by Claude Code skills, and every heading carries
provenance so the human can see exactly what the SME said vs. what the AI
added.

> **Reviewing the codebase?** Start with [ARCHITECTURE.md](ARCHITECTURE.md) —
> it has a cold-start reading guide (2 hours / 2 days / 2 weeks tracks), an
> end-to-end flow walkthrough, the data model, and the invariants the system
> depends on.

[karpathy]: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

## What it does

- **Elicit** — five perspective specialists (As-Is process, control & compliance,
  client experience, innovation, IT architecture) interview an SME in chat and
  write each answer into the wiki as a typed element.
- **Source from the web** — `source-cx`, `source-innovation`, `source-regulation`
  and `source-target` skills autonomously scan competitor moves, market trends,
  regulatory landscape and target-state ideas.
- **Ingest documents** — drop a DTP, memo or transcript into `raw-sources/<slug>/`
  and `/document-ingest` extracts it into the wiki, flagging conflicts against
  existing content.
- **Lint** — `/run-lint` re-checks every element against its schema template and
  sweeps the wiki for cross-section discrepancies, writing findings to a Review
  panel.
- **Approve** — every heading carries `provenance: { source, evidence }`. The app
  blocks approval until each heading is `elicited` (SME confirmed) or
  `document` (verbatim from an uploaded source).
- **Develop target state** — `/transformation-agent` takes the As-Is wiki and the
  risk / innovation perspectives and develops a target design with explicit
  transformation decisions, requirements, dependencies and gap-resolution.

## Architecture

Three layers, after Karpathy:

| Layer | Where | What |
|---|---|---|
| Raw sources | `raw-sources/<slug>/` | Immutable uploaded documents (DTPs, memos, transcripts) |
| Wiki | `wiki/processes/<slug>/` | Typed Markdown elements, one folder per section, with `index.md` + JSON sidecars (`sections.json`, `glossary.json`, `lint.json`, etc.) |
| Schema | `schema/process-schema.json` + `CLAUDE.md` + `SKILLS.md` + design docs | Element types, section order, approval rules, agent instructions |

Key extensions over the gist pattern:

- **Per-heading provenance** ([HALLUCINATION-PLAN.md](HALLUCINATION-PLAN.md))
  — every template heading is tagged `elicited | document | proposed | web |
  legacy-approved` with verbatim evidence. Heading-level approval gate.
- **Schema-driven element types** with required typed relations (e.g.
  `requirement.derivedFrom` is required, multi-target-typed).
- **Deterministic Python writers** — Claude emits element specs;
  [`scripts/wiki/write_element.py`](scripts/wiki/write_element.py) /
  [`patch_element.py`](scripts/wiki/patch_element.py) /
  [`set_approval.py`](scripts/wiki/set_approval.py) validate against the schema
  and write the Markdown. Claude never edits frontmatter directly.
- **Read-back eval** — graded fixtures in [`eval/read-back/`](eval/read-back/)
  verify the anti-hallucination block actually fires.

## Stack

- **App** — Next.js 16 (App Router, React 19), TypeScript, server components.
- **Skills** — 21 Claude Code skills under `.claude/skills/` (SKILL.md files).
  See [SKILLS.md](SKILLS.md) for the full architecture.
- **Scripts** — Python 3 helpers under `scripts/wiki/` for schema-validated
  wiki mutations. No external deps.

## Quickstart

```bash
git clone https://github.com/<you>/processminer.git
cd processminer
npm install

# Seed a demo process (Corporate Client Onboarding, ~76 elements)
node scripts/seed-cob-003.mjs

npm run dev
# → http://localhost:3000
```

Open the app, pick the seeded process, and run `/foundational-run` in the chat
to walk through it.

To start from scratch with your own process:

```bash
# In the chat: invoke /new-process and follow the prompts.
# Or scaffold by hand:
python3 scripts/wiki/scaffold_process.py <slug> "<Process Name>"
```

## Repository layout

```
processminer/
├── src/                            Next.js app (App Router + components)
├── schema/process-schema.json      Canonical content schema
├── scripts/wiki/                   Python toolkit (write_element, set_approval, …)
├── .claude/skills/                 21 Claude Code skills
├── wiki/processes/<slug>/          File-backed content store, one folder per process
├── raw-sources/<slug>/             Immutable uploaded source documents
├── feedback/                       App-feedback tree (FB-NNN.md)
├── eval/read-back/                 Read-back / anti-hallucination eval
├── CLAUDE.md                       Project guide for Claude Code
├── DESIGN.md                       Design system
├── SKILLS.md                       Agent / skill architecture
├── CONTENT-MODEL-PLAN.md           Schema decisions (D1–D6)
└── HALLUCINATION-PLAN.md           Per-heading provenance contract
```

## Running checks

```bash
npm run typecheck         # tsc --noEmit
npm test                  # node:test + scripts/wiki/test_wiki_scripts.py
npm run eval:read-back    # graded anti-hallucination eval
```

## Requirements

- Node ≥ 20
- Python ≥ 3.10
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) — the
  skills run inside the CLI, not the app. The app calls the CLI through a
  warm-worker pool defined in [`src/lib/session-worker.ts`](src/lib/session-worker.ts).

## License

MIT — see [LICENSE](LICENSE).

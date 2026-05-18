# Hallucination countermeasure — plan

Addresses the P1 item in `TODOS.md` ("Echtes Halluzinations-Gegenmittel
entwerfen"). Reconciles the dropped-Verifier note in `SKILLS.md` §5.
Reviewed via `/plan-eng-review` 2026-05-18 — decisions D1–D9 locked below.

## The problem, correctly framed

Processminer is an *SME-enrichment* tool. Source documents are patchy; most
good content comes from the SME during elicitation, not from a document. So
"trace every fact to a source document" is the wrong test — it would punish
exactly the enrichment that makes the tool valuable.

The real hallucination is not an invented fact. It is **the AI inflating a
thin SME comment into a confident, detailed paragraph** — adding plausible
operational detail the SME never said. The SME sees a tidy draft, it reads
right, and they approve it. The made-up part rides in on the back of the real
part. The danger is the **gap between what the SME said and what got written
down.**

## Scope (D1: full scope — all four parts)

All four parts ship in one plan: evidence capture, the said-vs-added split,
honest read-back, and approval gating.

## Locked design

### 1. Evidence is the inline SME quote (D2)
No transcript file. When the AI authors a heading from something the SME said,
it stores the **verbatim SME quote inline on the element**. The quote is the
record — self-contained, git-versioned with the element, no dangling
reference. Claude Code's own session log is ephemeral and not used as evidence.

### 2. Per-heading provenance, frontmatter map (D3, D6)
The said-vs-added split is marked **per schema-template heading** (## What it
checks, ## Control activity, …). Each element's frontmatter carries a
`provenance` map keyed by heading title:

```yaml
provenance:
  "What it checks":   { source: elicited, evidence: "<verbatim SME quote>" }
  "Control activity": { source: proposed, evidence: "" }
  "Risk addressed":   { source: document, evidence: "<quote from source doc>" }
  "Timing":           { source: web,      evidence: "<url> — <snippet> — fetched 2026-05-18" }
```

`source` taxonomy: `elicited` (SME said it) · `document` (from an uploaded
source) · `proposed` (AI-added, unconfirmed) · `web` (web-sourced,
unconfirmed) · `legacy-approved` (predates this rule, see migration).

Accepted risk: the map is keyed by heading title, so a renamed heading orphans
its entry. `check_conformance.py` MUST cross-check map keys against actual body
headings and fail loudly on a mismatch — this converts the drift into a caught
error, not a silent one.

### 3. Web-sourced elements (D4)
`source-innovation` / `source-cx` / `source-regulation` write headings with
`source: web` and `evidence` = inline URL + snippet + fetch date. No
raw-sources snapshot. Every web-sourced element stays `proposed` and is
**blocked from approval** until a specialist refines it with the SME, at which
point the confirmed headings flip to `elicited`.

### 4. Honest read-back (D8) + heading-level approval
When the AI turns a thin comment into a heading, it states what it added:
*"You told me you check the limit. I also wrote that it is automated, runs at
validation, and uses the facility system — you did not say those. True, or cut
them?"* This block is **inline-repeated, verbatim, in all five specialist
SKILL.md files plus `foundational-run`**, wrapped in a marked region
(`<!-- PROVENANCE-BLOCK:start/end -->`), with a check that all six copies are
byte-identical (honors SKILLS.md §5's stand-alone principle without drift).

Approval is **heading-level** (D3 makes sentence-level approval impossible —
you cannot approve finer than you mark). A heading's `source` flips from
`proposed` to `elicited` when the SME confirms it in read-back. Element
`approval` is gated: `set_approval.py` blocks `approved` while any heading is
`proposed`.

### 5. The `confidence` field stays (D7)
`confidence: high/medium/low` remains alongside `provenance`. The app should
visually subordinate it so it does not read as a peer trust signal next to
provenance.

### 6. Migration of the existing corpus (D5)
The 70+ already-approved funds-release elements get a one-time
`migrate_grandfather.py` pass: every element with `approval: approved` has each
heading tagged `source: legacy-approved`, exempt from the evidence requirement.
New, edited, and lint-reopened elements get the full treatment. The app badges
`legacy-approved` distinctly so the gap is never hidden. The corpus self-heals
as elements are touched.

### 7. Read-back eval (D9)
A focused, feature-scoped eval ships with this plan (not the full F6.1 suite):
a graded fixture set — SME says a thin thing, element is drafted, assert the AI
surfaced its additions in the read-back. Covers all six skills. Without it the
P1 countermeasure is unverifiable and a future prompt edit could silently
disable it.

## Data flow

```
SME turn ──▶ specialist authors heading ──▶ source = elicited|proposed
                         │                  evidence = verbatim quote
                         ▼
                   read-back: "I added X, Y — true?"
                         │
              SME confirms ──▶ proposed → elicited
              SME rejects  ──▶ heading cut / stays proposed
                         ▼
            set_approval.py: any proposed heading? ──▶ BLOCK approval
                         │ no
                         ▼
                  element approved
```

## What already exists (reused, not rebuilt)

- `foundational-run` already walks every element past the SME with a cursor
  (`review-state.json`) — extended to surface AI-added headings, not rebuilt.
- `approval/approvalBy/approvalDate` frontmatter + `set_approval.py` — the gate
  is added to the existing script.
- `check_conformance.py` already enforces required frontmatter; mirrored in
  `src/lib/conformance.ts` — new rules extend both.
- `write_element.py` / `patch_element.py` already own the file format — they
  gain the `provenance` map.
- The element diff-view (TODOS "Design") was blocked on having no AI-edit data;
  the `proposed` vs `elicited` split IS that data — this plan unblocks it.

## NOT in scope (explicitly deferred)

- **Durable transcript storage** — D2 chose inline quotes; no session-log
  artifact. If a full conversation record is later needed for audit, that is a
  separate change.
- **Web-page snapshots in raw-sources/** — D4 chose inline URL+snippet; durable
  page archival is deferred.
- **Sentence-level approval** — D3's per-heading marking caps approval at
  heading granularity; finer approval is not pursued.
- **Retiring the `confidence` field** — D7 keeps it; removal deferred.
- **The full F6.1 eval suite** — D9 builds only a feature-scoped read-back
  eval; the general suite stays a separate P2 item.
- **Backfilling evidence for existing elements** — D5 grandfathers them;
  no retroactive evidence derivation.

## Failure modes

| Codepath | Failure | Test? | Handled? | Visible? |
|---|---|---|---|---|
| `check_conformance.py` key cross-check | renamed heading orphans provenance | yes | fails loudly | yes |
| `set_approval.py` gate | a `proposed` heading slips to approved | yes | blocked; new headings default `proposed` | yes |
| `patch_element.py` | heading body edited, `source` left `elicited` → stale | yes | **patch MUST auto-flip edited heading to `proposed`** | yes |
| `write_element.py` | full rewrite of an approved element keeps a stale `approved` stamp | yes | **rewrite re-opens to `in-progress`, drops the approver** (post-review resolution, 2026-05-18) | yes |
| `migrate_grandfather.py` | a draft element mis-tagged `legacy-approved` | yes (regression) | only tags `approval: approved` elements | yes |
| read-back block | one of 6 copies drifts | yes (byte-identical check) | check fails CI | yes |
| `conformance.ts` vs Python | verdicts diverge | yes (parity test) | parity test fails CI | yes |

**Critical gap flagged:** `patch_element.py` editing a heading without flipping
its `source` back to `proposed` would let a hallucination re-enter a previously
approved element silently. The auto-flip is mandatory, not optional.

## Parallelization

| Lane | Work | Modules | Depends on |
|---|---|---|---|
| 0 | Define `provenance` frontmatter contract | `schema/` | — |
| A | Conformance + write/patch/approve/migrate scripts | `scripts/wiki/` | Lane 0 |
| B | Read-back block + provenance authoring in skills | `.claude/skills/` | Lane 0 |
| C | `conformance.ts` mirror + app diff-view | `src/` | Lane A |
| D | Scoped read-back eval | eval fixtures | Lane B |

Execution: Lane 0 first. Then **A and B in parallel** (separate module trees,
no shared files). Then **C and D in parallel** (C mirrors A, D evals B).

## Implementation Tasks
Synthesized from this review's findings. Each derives from a specific decision.

- [ ] **T1 (P1, human: ~1h / CC: ~10min)** — schema — Add the `provenance`
  frontmatter map to `process-schema.json` (per-heading `source` + `evidence`).
  - Surfaced by: D3, D6
  - Files: `schema/process-schema.json`
  - Verify: schema loads; existing elements still parse
- [ ] **T2 (P1, human: ~3h / CC: ~25min)** — conformance — Extend
  `check_conformance.py`: every non-`legacy-approved` heading needs a
  provenance entry with non-empty evidence; cross-check map keys against body
  headings; fail on mismatch.
  - Surfaced by: Architecture finding 1/2, D6
  - Files: `scripts/wiki/check_conformance.py`, `scripts/wiki/test_wiki_scripts.py`
  - Verify: `python scripts/wiki/test_wiki_scripts.py`
- [ ] **T3 (P1, human: ~2h / CC: ~20min)** — scripts — `write_element.py`
  writes the provenance map (new headings default `source: proposed`);
  `patch_element.py` auto-flips an edited heading to `proposed`.
  - Surfaced by: Failure modes (critical gap)
  - Files: `scripts/wiki/write_element.py`, `patch_element.py`, `test_wiki_scripts.py`
  - Verify: unit tests for default + auto-flip
- [ ] **T4 (P1, human: ~1.5h / CC: ~15min)** — scripts — `set_approval.py`
  blocks `approved` while any heading is `proposed`.
  - Surfaced by: Part 4 / heading-level approval
  - Files: `scripts/wiki/set_approval.py`, `test_wiki_scripts.py`
  - Verify: approval blocked with a `proposed` heading, allowed without
- [ ] **T5 (P1, human: ~2h / CC: ~15min)** — migration — New
  `migrate_grandfather.py`: tag every heading of every `approval: approved`
  element `source: legacy-approved`.
  - Surfaced by: D5
  - Files: `scripts/wiki/migrate_grandfather.py`, `test_wiki_scripts.py`
  - Verify: **REGRESSION (CRITICAL)** — all 70+ funds-release elements still
    pass conformance and remain `approved` after the pass
- [ ] **T6 (P1, human: ~4h / CC: ~30min)** — skills — Author the canonical
  provenance + read-back block; inline-repeat verbatim in the 5 specialist
  `SKILL.md` + `foundational-run`, wrapped in `PROVENANCE-BLOCK` markers; add
  the byte-identical check.
  - Surfaced by: D8
  - Files: `.claude/skills/{process,control-compliance,client-journey,innovation,it-architect}-specialist/SKILL.md`, `.claude/skills/foundational-run/SKILL.md`, a check script
  - Verify: byte-identical check passes
- [ ] **T7 (P1, human: ~1.5h / CC: ~15min)** — skills — `source-innovation` /
  `-cx` / `-regulation` write `source: web` headings with inline URL+snippet
  evidence, element left `proposed`.
  - Surfaced by: D4
  - Files: `.claude/skills/source-{innovation,cx,regulation}/SKILL.md`
  - Verify: a sourced element lands `proposed`, approval blocked
- [ ] **T8 (P1, human: ~2h / CC: ~20min)** — app — Mirror the conformance rules
  in `src/lib/conformance.ts`; parity test against the Python check.
  - Surfaced by: Test review (parity gap)
  - Files: `src/lib/conformance.ts`, a parity test
  - Verify: identical verdict on the same element fixture
- [ ] **T9 (P2, human: ~4h / CC: ~30min)** — app — Diff-view component renders
  `proposed` vs `elicited`/`document` headings distinctly (unblocks the TODOS
  diff-view item).
  - Surfaced by: What already exists / TODOS unblock
  - Files: app diff-view component
  - Verify: E2E — proposed headings visually distinct
- [ ] **T10 (P1, human: ~4h / CC: ~30min)** — eval — Scoped read-back eval: a
  graded fixture set over the 6 skills asserting AI additions are surfaced.
  - Surfaced by: D9
  - Files: eval fixtures + harness
  - Verify: eval runs green on current prompts
- [ ] **T11 (P2, human: ~2h / CC: ~20min)** — app — Subordinate `confidence`
  visually so it does not read as a peer of `provenance`.
  - Surfaced by: D7
  - Files: app element-render component
  - Verify: visual check

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 3 | CLEAR (PLAN) | 8 issues, 1 critical gap |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | CLEAR (FULL) | score 6→9 |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **UNRESOLVED:** 0 unresolved decisions (D1–D9 all answered).
- **VERDICT:** ENG CLEARED — ready to implement.

# Content-model extension plan — handoff baseline

Adds the content a documented process needs to be a credible baseline handed to
a BFA, Product Owner or Tech Architect. From the content-gap review of
2026-05-18; items numbered as in that review. Reviewed via `/plan-eng-review`
2026-05-18 — decisions D1–D6 locked below.

The schema (`schema/process-schema.json`) is layer 3 — area ▸ section ▸
element type. The deterministic scripts are schema-driven, so a new element
type is mostly a schema change plus specialist-skill phases. New elements
inherit the provenance model (HALLUCINATION-PLAN.md) automatically.

## What is being added

**Four new element types** + **one sidecar** + **one cross-cutting marker**:

| # | Addition | Form | Placement |
|---|---|---|---|
| 2 | `requirement` (REQ) | element | Target ▸ `requirements`, after transformation-decisions |
| 3 | `process-dependency` (DEP) | element | Target ▸ `dependencies`, after requirements |
| 5 | `stakeholder` (STK) | element | As-Is ▸ `stakeholders`, after roles |
| 7a | `assumption` (ASM) | element | Target ▸ `assumptions` (no fixed owner — D2) |
| 7b | glossary | **`glossary.json` sidecar** (D1) | per process, not an element |
| — | section-completeness marker | **`sections.json` sidecar** (D5) | every section |

Resulting section order:
- **As-Is Process:** overview → roles → stakeholders → process-steps →
  exceptions → pain-points → metrics → process-gaps
- **Target Process:** to-be-design → transformation-decisions → **requirements**
  → **dependencies** → **assumptions** → gap-resolution → validation

## Locked decisions

- **D1 — Glossary is a sidecar.** A one-line term is reference data, not a
  multi-block documented element. `glossary.json` per process (one entry
  `{term, type, definition}`), written by a deterministic script, surfaced in
  the app. No `glossary-term` element type, no glossary section.
- **D2 — Assumptions are a cross-cutting element.** `assumption` lives in an
  `assumptions` section that has **no fixed `specialist`**. Ownership — who
  challenges it — is resolved from its `bearsOn` target: bearsOn → that
  element's section → that section's specialist. `bearsOn` is therefore
  **required** (an assumption with none has no owner).
- **D3 — Requirement traceability is multi-target.** `requirement.derivedFrom`
  is **required** and accepts a `transformation-decision`, a `gap`, or a
  `to-be-design` element. The schema gains the ability to express a relation
  with more than one valid target type.
- **D4 — Requirements use MoSCoW.** `requirement` carries a `moscow` field
  [MUST | SHOULD | COULD | WONT] — the requirements vocabulary a BFA expects,
  stating scope commitment, not just rank.
- **D5 — Section-completeness marker, folded in.** Every section records a
  status — `worked` (N elements), `confirmed-empty` (the SME said none), or
  `not-visited`. Closes the "empty section = confirmed-none OR not-done?"
  ambiguity that the new, often-sparse sections sharpen.
- **D6 — New mechanics are deterministic scripts.** A `set_section_status.py`
  script writes the marker; an owner-resolution helper in `wiki_lib.py`
  resolves `bearsOn` → specialist. Skills call them — no logic repeated as
  prose across six `SKILL.md` files (SKILLS.md §6: scripts do mechanics).

## Element specifications

### 2 · `requirement` (REQ) — Target ▸ requirements — innovation-analyst
- **frontmatter:** `reqType` [FUNCTIONAL | NON-FUNCTIONAL], `moscow`
  [MUST | SHOULD | COULD | WONT]
- **relations:** `derivedFrom` → transformation-decision | gap | to-be-design
  (**required**, multi-target), `addresses` → gap (optional)
- **required:** reqType, moscow, derivedFrom
- **template:** *Requirement* (one testable statement of what the target must
  do) · *Rationale* (the decision or gap it comes from) · *Acceptance criteria*
  (bullets)

### 3 · `process-dependency` (DEP) — Target ▸ dependencies — innovation-analyst
The target process's own boundary — its upstream feeders and downstream
consumers in the to-be design.
- **frontmatter:** `direction` [UPSTREAM | DOWNSTREAM | BIDIRECTIONAL]
- **relations:** `atStep` → process-step (**required**), `viaSystem` → system
- **required:** direction, atStep
- **template:** *The dependency* · *What crosses the boundary* · *Why it matters*

### 5 · `stakeholder` (STK) — As-Is ▸ stakeholders — process-specialist
- **frontmatter:** `stakeholderType` [SPONSOR | PROCESS-OWNER | GOVERNANCE |
  REGULATOR | CLIENT | VENDOR | INTERNAL], `influence` [HIGH | MEDIUM | LOW]
- **relations:** `roles` → role (optional)
- **required:** stakeholderType
- **template:** *Who they are* · *Stake in the process* · *Engagement*

### 7a · `assumption` (ASM) — Target ▸ assumptions — owner via `bearsOn` (D2)
- **frontmatter:** `assumptionStatus` [OPEN | CONFIRMED | INVALIDATED]
- **relations:** `bearsOn` → any element (**required** — ownership resolves
  from it)
- **required:** assumptionStatus, bearsOn
- **template:** *The assumption* · *Why it is unconfirmed* · *Impact if wrong*

### 7b · glossary — `glossary.json` sidecar (D1)
- Per-process sidecar, one entry `{term, termType [TERM|ACRONYM|SYSTEM],
  definition}`. Written by a deterministic script; rendered by the app. Outside
  the element/provenance/approval machinery.

### Section-completeness marker — `sections.json` sidecar (D5)
- Per-process sidecar, one entry per section `{status, count, by, date}`.
  `status` ∈ worked | confirmed-empty | not-visited. Written by
  `set_section_status.py`; the specialists' `[A]/[E]/[N]` idiom calls it — `[N]`
  records `confirmed-empty`.

## Why the sequencing (per the brief)

- **Requirements after transformation-decisions** — a decision is *what we will
  change*; a requirement operationalises it into a *testable statement*.
  Requirements before gap-resolution so each resolved gap cites the requirement
  that closes it.
- **Dependencies in Target after requirements** — the target process's own
  boundary; grouped with requirements and assumptions as the architecture
  handoff package, owned by innovation-analyst.
- **Assumptions in Target** — the assumptions the to-be design and the
  transformation rest on; the section's home area, ownership still per
  `bearsOn` (D2).
- **Stakeholders after roles** — roles do the work, stakeholders hold an
  interest; both current-state, same specialist, natural adjacency.

## foundational-run scope

- `stakeholder` — current-state → **challenged** in the foundational run
  (`review_cursor` builds the queue from the schema).
- `requirement`, `dependency` — Target area, forward-looking → **not** in the
  foundational run (like to-be-design).
- `assumption` — challenged through its `bearsOn`-resolved owner, not as its
  own queue item.

## Data flow — assumption ownership

```
assumption.bearsOn ──▶ target element ──▶ its type ──▶ type.section
                                                          │
                                              section.specialist
                                                          │
                                          (challenge through that lens)
   bearsOn missing / target deleted ──▶ resolver returns no owner ──▶ flag,
                                          never silently skip the assumption
```

## What already exists (reused, not rebuilt)

- **Schema-driven scripts** — `write_element`, `next_id`, `check_conformance`
  need no change for new types beyond the multi-target relation.
- **The provenance model** — the 4 new element types inherit it automatically.
- **The `[A]/[E]/[N]` idiom** — extended: the `[N]` path now calls
  `set_section_status.py` instead of silently leaving a folder empty.
- **The sidecar pattern** — `lint.json` / `ingest.json` precedent;
  `glossary.json` and `sections.json` follow it.
- **`add-entry` skill** — works for the new types unchanged (schema-driven).
- **Sections with no `specialist`** — `competitor-cx`, `cx-benchmarks`,
  `market-trends` already have none; the `assumptions` section follows that
  precedent.

## NOT in scope (deliberately deferred)

- The other three content gaps from the review — **data/information model**,
  **general risk register**, **cost/business case**. Larger; separate decisions.
- A **requirements-traceability visual** (requirement → decision → gap graph) —
  nice-to-have, not needed for the baseline.
- The **baseline-export deliverable** itself (a `process-baseline` skill) —
  its own plan; this plan only fills the content it would assemble.

## Failure modes

| Codepath | Failure | Test? | Handled? | Visible? |
|---|---|---|---|---|
| owner-resolution helper | `assumption.bearsOn` points at a deleted element → no owner | yes | bearsOn required + conformance checks target exists; resolver flags unresolvable | yes |
| foundational-run / qer-session | a section with no `specialist` (assumptions) is hit by code assuming one | yes | per-element owner resolution; section-level specialist optional | yes |
| `check_conformance` multi-target | `derivedFrom` points at a disallowed type | yes | conformance rejects unless target type ∈ {transformation-decision, gap, to-be-design} | yes |
| `set_section_status.py` | re-run double-counts or clobbers a real status | yes | idempotent; count derived from the folder, not accumulated | yes |

**Critical gap flagged:** an `assumption` with a dangling `bearsOn` would have
no owner and could silently never be challenged. Mitigation is mandatory:
`bearsOn` required + conformance verifies the target exists + the resolver
returns an explicit "unresolved" the skills surface.

## Parallelization

| Lane | Work | Modules | Depends on |
|---|---|---|---|
| 0 | Schema — types, sections, enums, multi-target relation | `schema/` | — |
| A | Conformance + 2 new scripts + owner-resolution helper + tests | `scripts/wiki/` | Lane 0 |
| B | Specialist phases + foundational-run | `.claude/skills/` | Lane 0 |
| C | App — render new types, the marker, the glossary | `src/` | Lane A |

Lane 0 first; then **A ‖ B**; then **C**. Tests ride Lane A.

## Implementation Tasks

- [ ] **T1 (P1, human: ~2h / CC: ~20min)** — schema — Add the 4 element types,
  the `requirements`/`dependencies`/`stakeholders`/`assumptions` sections in
  order, the new enums (`reqType`, `moscow`, `direction`, `stakeholderType`,
  `assumptionStatus`), and multi-target relation support.
  - Surfaced by: D1–D5 · Files: `schema/process-schema.json` · Verify: schema loads, `show_template.py` prints each new type
- [ ] **T2 (P1, human: ~2h / CC: ~20min)** — conformance — Multi-target
  relation resolution in `check_conformance.py` and `conformance.ts`; confirm
  the 4 new types validate.
  - Surfaced by: D3 · Files: `scripts/wiki/check_conformance.py`, `src/lib/conformance.ts`
- [ ] **T3 (P1, human: ~3h / CC: ~25min)** — scripts — New `set_section_status.py`;
  new glossary-sidecar writer; owner-resolution helper in `wiki_lib.py`.
  - Surfaced by: D1, D5, D6 · Files: `scripts/wiki/set_section_status.py`, `scripts/wiki/write_glossary.py`, `scripts/wiki/wiki_lib.py`
- [ ] **T4 (P1, human: ~2h / CC: ~20min)** — skill — process-specialist:
  stakeholders phase + glossary capture; the `[A]/[E]/[N]` idiom's `[N]` path
  calls `set_section_status.py`.
  - Surfaced by: item 5, D5 · Files: `.claude/skills/process-specialist/SKILL.md`
- [ ] **T5 (P1, human: ~2.5h / CC: ~25min)** — skill — innovation-analyst:
  requirements phase and dependencies phase, both after transformation-decisions.
  Assumptions are recorded cross-cutting (any specialist, no dedicated phase) —
  add the shared "record an assumption" instruction.
  - Surfaced by: items 2,3,7 · Files: `.claude/skills/innovation-analyst/SKILL.md`
- [ ] **T6 (P1, human: ~2h / CC: ~20min)** — skill — foundational-run: queue
  dependencies + stakeholders as current-state; exclude requirements; route
  assumption challenge via owner-resolution.
  - Surfaced by: foundational-run scope · Files: `.claude/skills/foundational-run/SKILL.md`
- [ ] **T7 (P2, human: ~3h / CC: ~25min)** — app — Render the 4 new types
  (schema-driven, verify), the section-completeness marker, and the glossary.
  - Surfaced by: D1, D5 · Files: `src/`
- [ ] **T8 (P1, human: ~2.5h / CC: ~25min)** — tests — Extend
  `test_wiki_scripts.py`: one element of each new type + conformance + required
  relations; multi-target `derivedFrom` accept/reject; `set_section_status.py`
  three states + idempotency; owner-resolution incl. dangling `bearsOn`;
  glossary writer.
  - Surfaced by: Test review · Files: `scripts/wiki/test_wiki_scripts.py` · Verify: `npm run test:scripts`

## Open decisions

All resolved (D1–D6). Requirement placement (after transformation-decisions)
was fixed by the brief.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR (PLAN) | 6 issues, 1 critical gap |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **UNRESOLVED:** 0 — decisions D1–D6 all answered.
- **VERDICT:** ENG CLEARED — ready to implement.

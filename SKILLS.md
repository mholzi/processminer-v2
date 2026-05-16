# Skills & Agent Architecture — Processminer v2

The agent design for Processminer v2, captured from the architecture
brainstorm (2026-05-16). This is the **design**; in the current build every
agent behaviour is stubbed (see §11).

Read this before building or changing any agent/skill. UI/visual decisions
still defer to `DESIGN.md`; build sequencing lives in `TODOS.md`.

---

## 1. Overview

Processminer's loop is **Extract → Document → Develop**: AI agents extract SME
process knowledge through interactive brainstorming, document it as wiki
elements, and develop it into a Target State. The wiki is Karpathy's 3-layer
LLM-Wiki (`raw-sources/` → `wiki/` → `schema/`).

The agent design has **two axes**:

- **Perspective specialists** — the agents. Five domain experts, each looking
  at the same process through a different lens.
- **Functional engine** — shared machinery (brainstorm / author / verify) that
  every specialist runs with its own expertise.

This keeps the build tractable: one engine + five expertise packages, not
fifteen separate agents.

---

## 2. The perspective specialists

Each specialist is a domain-expertise package over the shared engine (§3):
domain knowledge, a question bank, brainstorming techniques, and the slice of
the schema it owns.

| Specialist | Lens | Owns (element types) |
|---|---|---|
| **Process Specialist** | operational mechanics — who does what, in what order, where it breaks | process-step, exception, role, metric, process-gap, pain-point |
| **Control & Compliance Specialist** | risk & regulatory (one specialist — a control exists to satisfy a regulation) | control, regulation, compliance-gap, audit-finding |
| **Client Journey Specialist** | the customer's experience — effort, emotion, friction | cx-touchpoint, moment, cx-channel, friction-point |
| **Innovation Analyst** | forward-looking — scan, ideate, and design the target state | market-trend, innovation-idea, innovation-risk, target-state, transformation-decision, gap |
| **IT Architect** | the systems landscape | system, integration |

Mapped to the four schema areas:

- **As-Is Process** — worked by **three** specialists at once (Process /
  Control / Client Journey). This is where cross-perspective collaboration is
  densest, because As-Is elements carry the most relations.
- **Innovation + Target Process** — the Innovation Analyst's.
- **IT Architecture** — the IT Architect's.

Note: **pain-points** are staff/process pain (→ Process); **friction-points**
are client-facing pain (→ Client Journey). Pains and gaps in general are
*outputs* a specialist produces, not perspectives — there is no "pain-point
specialist".

---

## 3. The shared functional engine

Built once; every specialist instantiates it with its own expertise. Not
separate agents — capabilities/stages.

- **Brainstorm** — interactive extraction. Drives a technique-led brainstorming
  conversation with the SME (BMAD brainstorming techniques), asks targeted
  questions, follows threads.
- **Author** — turns extracted knowledge into a wiki element that conforms to
  the element type's schema template (named blocks, format, length). Also
  powers per-element "AI edit". Its output is checked by the deterministic
  conformance check that already exists in code.
- **Verify** — challenges and cross-checks drafted content (see also §4, the
  Verifier).

---

## 4. Cross-cutting functions

These serve every perspective rather than holding one — so they sit outside
the specialist roster.

- **Wiki Assistant** — answers SME / transformation-team questions grounded in
  the wiki. Powers the chat panel.
- **Document Ingest** — parses an uploaded raw document, extracts candidate
  elements, classifies them by type/section, then hands fragments to the
  relevant specialists to integrate.
- **Verifier (hallucination guard)** — challenges extracted claims, cross-checks
  against raw sources, asks negative/confirmation questions. **P1** per
  `TODOS.md` — in a compliance context, self-rated LLM confidence is worthless,
  so verification cannot be optional.

---

## 5. The orchestrator

The orchestrator is **deterministic code, not an LLM agent.** It is *not* a
"manager agent" that decides routing by LLM judgment.

Why deterministic:
- **Auditable** — a bank must be able to show the workflow. "The state machine
  moved from Brainstorm to Verify per rule X" is auditable; "the LLM decided
  to" is not.
- **Guarantees hold** — Verify always runs; it cannot be skipped at an LLM's
  discretion.
- Avoids an orchestration monolith (`TODOS.md` F1.2), context bloat, extra
  cost, and a larger prompt-injection surface (F3.1).

Responsibilities:
- Convenes specialists; routes work to them (§7).
- Owns the QER session state machine (§6).
- **Is the whole-process lead** — holds the cross-process view; the Overview
  screen is its computed roll-up. There is no separate generalist agent.

Control flow is code; **judgment within a stage is the LLM's.** The orchestrator
may *consult* an LLM at a named decision point, but never hands it the routing.

---

## 6. The QER session lifecycle

A deterministic state machine. The human picks what to work on and decides when
it is done; the orchestrator choreographs the extract→document→verify loop in
between.

```
[human] SELECT → BRAINSTORM → DRAFT → VERIFY → PRESENT → [human] CONFIRM → (next | done)
                     ↑_____________________|   (Verify finds a gap → loop back)
```

- **SELECT** — the human picks the process / area / section. Human-driven.
- **BRAINSTORM / DRAFT / VERIFY** — the active specialist runs the shared
  engine; the orchestrator drives the transitions.
- **PRESENT** — drafts surface in the UI as `draft` elements.
- **CONFIRM** — the human reviews via the **existing UI** (approval dropdown +
  inline edit). This stage is already built.
- The session ends when the human decides — there is no automated completion
  criterion (see §8).

*Open: the exact stage set and the Verify→Brainstorm loop condition are to be
refined.*

---

## 7. Collaboration model — how specialists "work together"

Three mechanics, all driven by the deterministic orchestrator (code convenes;
no LLM router):

1. **Section ownership** — working a section activates its owning specialist
   (§2). Deterministic routing.
2. **Cross-perspective review** — when one specialist drafts or changes an
   element, the other relevant specialists review it from their lens (Process
   drafts a step → Control checks for a missing control → Client Journey checks
   for a missing touchpoint). The orchestrator decides *which* specialists
   review, deterministically, from a static **element-type → relevant-
   perspectives** map derived from the schema's relation types.
   - **Route by *potential* relations, not actual ones.** The Control
     Specialist must review *every* process-step, including those with no
     control linked — "step missing a control" is the most valuable finding it
     can produce.
3. **Lint = the council** — a lint pass is every specialist sweeping the whole
   wiki from its lens. Cross-section discrepancies are literally cross-
   perspective disagreements.

---

## 8. The approval / "done" model

Human-driven. The machine never declares the work finished — it informs.

- **"Done" = an element is approved.** Approval is per element (the existing
  status dropdown: `in-progress` / `approved` / `rejected`), stamped with who
  and when.
- **No separate section/process "done" state** — that is a computed roll-up.
- **Bulk-approve per section** — a convenience action over the section's
  `in-progress` elements (leaves `rejected` ones alone).
- **No locking** — approved elements stay editable.
- **Approved auto-reverts to `in-progress`** when any pillar of "done" breaks:

  | Trigger | When it fires |
  |---|---|
  | An edit (SME *or* agent) | immediately, at save — the reviewed content no longer exists |
  | A conformance issue | at the next lint sweep |
  | A lint finding implicates it (discrepancy, structure, or clarifying question) | at the next lint sweep |

- **Warn and allow** — the SME *may* approve an element that is currently
  non-conformant or lint-flagged; they are warned, not blocked. That approval
  stands until the next lint run.
- **Run lint is therefore a core workflow rhythm**, not an optional aid — it is
  the checkpoint that keeps the whole "approved" set honest. It should run
  automatically at the end of a QER session, not only on the button.

---

## 9. What invokes what

Most operations invoke exactly one skill (or a short fixed chain). Only the QER
session choreographs several. The *decision to invoke* is always code — UI
action or orchestrator — never an LLM router.

| Operation | Invokes | Notes |
|---|---|---|
| Conformance check | — | pure code, exact, already built |
| Approval revert / sweep | — | pure code |
| Run lint (semantic half) | the specialists, as the council | conformance half is code |
| Upload / ingest | Document Ingest → specialists | extract, then integrate per perspective |
| Chat | Wiki Assistant | one skill |
| AI edit | Author (of the owning specialist) | one skill |
| Deep Dive | Brainstorm (scoped, owning specialist) | one skill |
| New process | scaffolds the wiki, then SELECT | interactive intake |
| QER session | Brainstorm → Author → Verify, across specialists | the only multi-skill flow |

---

## 10. Open questions

- **QER session stages** — exact stage set and the Verify→Brainstorm loop
  condition (§6).
- **MVP slice** — candidate: the extract loop only (Process/Control/Client
  Journey specialists + shared engine + orchestrator + Verifier + Wiki
  Assistant); defer Ingest, semantic Lint, new-process, Innovation Analyst, IT
  Architect.
- **Model endpoint & cost** — `TODOS.md` P1. One abstraction so the bank-gateway
  swap is a single change. Cross-perspective review (§7.2) is the main cost
  lever.
- **Hallucination antidote** — `TODOS.md` P1; how the Verifier concretely
  challenges extraction against raw sources.

Decided in the brainstorm: completion is human-driven (§8); the orchestrator is
deterministic code (§5); the roster is the five specialists (§2).

---

## 11. Build status

Everything above is stubbed in the current build. The stubs and the skills that
will replace them:

| Stub in the app today | Skill that replaces it |
|---|---|
| Deep Dive → "QER session" message | Brainstorm (scoped) |
| "⌘ AI edit" (disabled) | Author |
| Lint — semantic findings (`STUB_FINDINGS`) | the specialist council |
| Upload document → extraction (`stubIngest`) | Document Ingest |
| Agent chat replies | Wiki Assistant |
| "+ New process" message | new-process intake |

The deterministic conformance check (`src/lib/conformance.ts`) and the approval
mechanics are already real — they are code, not skills.

---

## 12. BMAD reuse

v1 (`mholzi/Processminer`) ran *on* BMAD as a custom module (`bmad-custom-
modules-src/process-miner/`). v2 is a from-scratch web app, so BMAD's
core-skills are **not runtime dependencies** here — they are reused as
*patterns to mirror* and *content assets to vendor in*. Source:
[`bmad-code-org/BMAD-METHOD`](https://github.com/bmad-code-org/BMAD-METHOD),
`src/core-skills/`.

### Adopt — patterns for the shared engine (§3)

| BMAD core-skill | Reused in v2 as |
|---|---|
| `bmad-brainstorming` | the **Brainstorm** function — its step structure (setup → technique-select → execute → organise) is the template for the extraction loop |
| `bmad-advanced-elicitation` | deeper probing inside Brainstorm, and the **Verifier**'s refinement methods |
| `bmad-review-adversarial-general` | the **Verifier**'s adversarial stance; its findings-report shape matches our lint findings |
| `bmad-review-edge-case-hunter` | edge-case / exception analysis — feeds the Process Specialist and **Verify** |

### Content assets to vendor in

Two CSVs are pure content — lift them directly; they become the technique
banks each specialist draws on:

- `src/core-skills/bmad-brainstorming/brain-methods.csv` — the brainstorming
  technique library.
- `src/core-skills/bmad-advanced-elicitation/methods.csv` — critique methods
  (socratic, first-principles, pre-mortem, red-team).

### Useful for one specific function

- `bmad-editorial-review-prose` — a clarity pass on **Element Author** output
  (enforces the "self-explanatory for an SME" principle on prose blocks).
- `bmad-distillator` — optional pre-processing of a large uploaded document
  before **Document Ingest** extracts elements from it.

### Do not adopt

- **`bmad-party-mode`** — conceptually it is the multi-specialist
  collaboration, but its mechanism is *free-form agent chat*, which conflicts
  with the deterministic orchestrator (§5). Inspiration only — cross-
  perspective review is a fixed code fan-out, not an emergent conversation.
- `bmad-editorial-review-structure` — structure is schema-driven; the
  conformance check already covers it.
- `bmad-customize` / `-help` / `-index-docs` / `-shard-doc` — BMAD-install
  tooling; the v2 app handles navigation, help and structure itself.

### v1 alignment

The v1 `process-miner` module already validated this design — its agent roster
(Process Documentation Analyst, Control Analyst, Client Journey Analyst,
Innovation Analyst, Transformation Agent, plus planned IT Architect and QA
Agent) maps almost 1:1 onto the five specialists in §2. Its `start-new-process`
workflow — a 9-step progressive-elicitation loop (init → import → overview →
process-steps → exceptions → pain-points → controls → systems → validation) —
is the concrete precedent for the QER session in §6.

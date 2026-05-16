# Skills & Agent Architecture — Processminer v2

The agent design for Processminer v2, from the architecture brainstorm of
2026-05-16, revised for the **Claude-Code-skills runtime** (§2).

The skills do not exist yet. They will be created with the `skill-creator`
skill, porting from v1's `process-miner` module (§13). Read this before
creating or changing any skill. UI/visual decisions defer to `DESIGN.md`;
build sequencing lives in `TODOS.md`.

---

## 1. Overview

Processminer's loop is **Extract → Document → Develop**: agents extract SME
process knowledge through interactive brainstorming, document it as wiki
elements, and develop it into a Target State. The wiki is Karpathy's 3-layer
LLM-Wiki (`raw-sources/` → `wiki/` → `schema/`).

The design has **two axes**:

- **Perspective specialists** — five domain experts, each looking at the same
  process through a different lens (§3).
- **Functional engine** — shared machinery (brainstorm / author / verify) every
  specialist runs with its own expertise (§4).

One engine + five expertise packages — not fifteen separate agents.

---

## 2. Runtime — Claude Code skills

**The skills are Claude Code skills** — `SKILL.md` files (plus supporting
workflow and step files) that live in the repo and run **locally in the CLI**
by Claude Code. No API key, no hosted model endpoint, no app backend calling a
model. This mirrors v1, which ran as a BMAD custom module inside an agentic CLI.

The skills operate **directly on the file-backed wiki** — they Read, Grep and
Write the markdown under `wiki/`, against `schema/`, sourcing from
`raw-sources/`. A CLI agent has filesystem tools, so there is no need for an
embedding/retrieval subsystem — the agent searches the wiki files natively.

**The web app is a separate viewer/review surface.** The Next.js app in `src/`
shows the documented wiki: the SME reads the process doc, edits elements,
approves/rejects them (plain file writes), and sees the deterministic
conformance check. It does **not** invoke agents. Its current agent-triggering
UI — the chat panel, Deep Dive, "AI edit", document upload — is stubbed and
will be reworked or removed; those are CLI-skill concerns now (§11).

The split: **Claude Code runs the extraction; the web app reviews the result.**

---

## 3. The perspective specialists

Each specialist is a domain-expertise package over the shared engine (§4):
domain knowledge, a question bank, brainstorming techniques, and the slice of
the schema it owns. Each is realised as a Claude Code skill (or a subagent the
session skill dispatches to — exact packaging decided during skill creation).

| Specialist | Lens | Owns (element types) |
|---|---|---|
| **Process Specialist** | operational mechanics — who does what, in what order, where it breaks | process-step, exception, role, metric, process-gap, pain-point |
| **Control & Compliance Specialist** | risk & regulatory (one specialist — a control exists to satisfy a regulation) | control, regulation, compliance-gap, audit-finding |
| **Client Journey Specialist** | the customer's experience — effort, emotion, friction | cx-touchpoint, moment, cx-channel, friction-point |
| **Innovation Analyst** | forward-looking — scan, ideate, design the target state | market-trend, innovation-idea, innovation-risk, target-state, transformation-decision, gap |
| **IT Architect** | the systems landscape | system, integration |

Mapped to the four schema areas:

- **As-Is Process** — worked by **three** specialists at once (Process /
  Control / Client Journey). Cross-perspective collaboration is densest here,
  because As-Is elements carry the most relations.
- **Innovation + Target Process** — the Innovation Analyst's.
- **IT Architecture** — the IT Architect's.

Note: **pain-points** are staff/process pain (→ Process); **friction-points**
are client-facing pain (→ Client Journey). Pains and gaps generally are
*outputs* a specialist produces, not perspectives — there is no "pain-point
specialist".

---

## 4. The shared functional engine

Shared skill content every specialist runs with its own expertise — shared
workflow steps and instructions, not separate agents.

- **Brainstorm** — interactive extraction. A technique-led brainstorming
  conversation with the SME (BMAD brainstorming techniques, §13), targeted
  questions, thread-following.
- **Author** — turns extracted knowledge into a wiki element conforming to the
  element type's schema template (named blocks, format, length). The
  deterministic conformance check (`src/lib/conformance.ts`, already built)
  validates the output.
- **Verify** — challenges and cross-checks drafted content (see §5, the
  Verifier).

---

## 5. Cross-cutting functions

These serve every perspective rather than holding one — separate skills,
outside the specialist roster.

- **Wiki Assistant** — answers SME / transformation-team questions grounded in
  the wiki.
- **Document Ingest** — parses a raw document, extracts candidate elements,
  classifies them by type/section, hands fragments to the relevant specialists.
- **Verifier (hallucination guard)** — challenges extracted claims, cross-checks
  against `raw-sources/`, asks negative/confirmation questions. **P1** per
  `TODOS.md` — in a compliance context self-rated LLM confidence is worthless,
  so verification cannot be optional.

---

## 6. The orchestration workflow

There is no "manager agent." Orchestration is the skill's **workflow** — a
`workflow.md` plus numbered step files (`steps/step-01-*.md` …), exactly as
v1's `start-new-process` is built.

It is **deterministic**: the step sequence is authored markdown, not an LLM
routing decision. Claude Code executes each step; the step file says what to do
and when to advance. **Judgment within a step is the model's; the sequence is
fixed.**

Why this matters:
- **Auditable** — a bank can show the workflow. "Step 07 ran, then step 08" is
  auditable; "the LLM decided to" is not.
- **Guarantees hold** — Verify is a step in the sequence; it cannot be skipped.
- Avoids an orchestration monolith (`TODOS.md` F1.2).

The workflow holds the cross-process view; the web app's Overview screen is a
read-only roll-up of the wiki files the workflow produced.

---

## 7. The QER session lifecycle

The QER session is one skill with a multi-step workflow (§6). The human picks
what to work on and decides when it is done; the workflow choreographs the
extract→document→verify loop in between.

```
[human] SELECT → BRAINSTORM → DRAFT → VERIFY → PRESENT → [human] CONFIRM → (next | done)
                     ↑_____________________|   (Verify finds a gap → loop back)
```

- **SELECT** — the human picks the process / area / section. Human-driven.
- **BRAINSTORM / DRAFT / VERIFY** — workflow steps; the active specialist runs
  the shared engine (§4).
- **PRESENT** — the workflow writes the wiki files as `draft` elements.
- **CONFIRM** — the human reviews **in the web app** (approval dropdown + inline
  edit, both already built). CLI extracts; the app reviews.
- The session ends when the human decides — there is no automated completion
  criterion (see §9).

*Open: the exact step set and the Verify→Brainstorm loop condition (§11).*

---

## 8. Collaboration model — how specialists "work together"

Three mechanics, all driven by the workflow's authored step sequence (§6) —
no LLM router:

1. **Section ownership** — working a section activates its owning specialist
   (§3).
2. **Cross-perspective review** — when one specialist drafts or changes an
   element, the other relevant specialists review it from their lens (Process
   drafts a step → Control checks for a missing control → Client Journey checks
   for a missing touchpoint). The workflow decides *which* specialists review,
   from a static **element-type → relevant-perspectives** map derived from the
   schema's relation types.
   - **Route by *potential* relations, not actual ones.** The Control
     Specialist reviews *every* process-step, including those with no control
     linked — "step missing a control" is the most valuable finding it produces.
3. **Lint = the council** — a lint pass is every specialist sweeping the whole
   wiki from its lens. Cross-section discrepancies are cross-perspective
   disagreements.

---

## 9. The approval / "done" model

Human-driven. The machine never declares the work finished — it informs. This
operates in the web app on the wiki files.

- **"Done" = an element is approved.** Per element (the status dropdown:
  `in-progress` / `approved` / `rejected`), stamped with who and when.
- **No separate section/process "done" state** — a computed roll-up.
- **Bulk-approve per section** — over the section's `in-progress` elements
  (leaves `rejected` ones alone).
- **No locking** — approved elements stay editable.
- **Approved auto-reverts to `in-progress`** when any pillar of "done" breaks:

  | Trigger | When it fires |
  |---|---|
  | An edit (SME *or* skill) | immediately, at save — the reviewed content no longer exists |
  | A conformance issue | at the next lint sweep |
  | A lint finding implicates it (discrepancy, structure, or clarifying question) | at the next lint sweep |

- **Warn and allow** — the SME *may* approve a non-conformant or lint-flagged
  element; they are warned, not blocked. That approval stands until the next
  lint run.
- **Lint is a core workflow rhythm**, not an optional aid — the checkpoint that
  keeps the "approved" set honest.

---

## 10. How skills are invoked

Skills run in Claude Code — invoked by `/skill-name` or by description match.
There is no app-driven invocation.

| Skill | Shape |
|---|---|
| **QER session** | one skill, multi-step workflow (§6); invokes the specialists |
| **Specialists** ×5 | skills (or subagents) the session dispatches to |
| **Wiki Assistant** | standalone skill — grounded Q&A over the wiki |
| **Document Ingest** | standalone skill — extract from a raw doc, then hand to specialists |
| **Lint / the council** | a skill that runs every specialist over the wiki |
| **Verifier** | a step in the session, and a standalone challenge skill |

The deterministic conformance check stays **code** in the web app
(`src/lib/conformance.ts`) — it is not a skill.

---

## 11. Open questions

- **QER session steps** — the exact step set and the Verify→Brainstorm loop
  condition (§7).
- **Skill packaging** — five separate specialist skills vs one session skill
  with specialist subagents. Decide during skill creation.
- **MVP slice** — candidate: the extract loop only (Process/Control/Client
  Journey + shared engine + the session workflow + Verifier); defer Ingest,
  the council lint, new-process, Innovation Analyst, IT Architect.
- **Hallucination antidote** — `TODOS.md` P1; how the Verifier concretely
  challenges extraction against `raw-sources/`.
- **Web-app rework** — what becomes of the stubbed agent UI (§2).

Decided: runtime is Claude Code skills (§2); completion is human-driven (§9);
orchestration is an authored step workflow, not app code (§6); the roster is
the five specialists (§3).

---

## 12. The web app, restated

Not a skill, but it shares the wiki. Under the Claude-Code-skills runtime the
web app's job narrows to a **viewer / review surface**:

- **Keeps** — process-doc display, RACI matrix, Overview roll-up, structure
  templates, search, inline edit, the approval model (§9), the deterministic
  conformance check.
- **Reworked or removed** — the chat panel, Deep Dive buttons, "AI edit",
  document upload. These imply the app calls agents; it does not. Options:
  remove them, or repurpose as views of CLI-session output. To be decided.

---

## 13. v1 port base & BMAD reuse

v2's skills are Claude Code skills — the **same family** as v1's BMAD module and
the BMAD core-skills. So this is a **port**, not a from-scratch build.

### v1 `process-miner` — the port base

v1 (`mholzi/Processminer`, `bmad-custom-modules-src/process-miner/`) already
built this:

- **Agents** — Process Documentation Analyst, Control Analyst, Client Journey
  Analyst, Innovation Analyst, Transformation Agent (+ planned IT Architect, QA
  Agent). Maps almost 1:1 onto the five specialists (§3).
- **`start-new-process`** — a 9-step progressive-elicitation workflow (init →
  import → overview → process-steps → exceptions → pain-points → controls →
  systems → validation). The concrete precedent for the QER session (§7).
- **Templates** and a structured referencing system (PS#, EX#, CP#, …).

Porting means: adapt these to Claude Code's `SKILL.md` format and the v2 wiki
schema (`schema/process-schema.json`, which already carries per-type templates).

### BMAD core-skills to reuse

Source: [`bmad-code-org/BMAD-METHOD`](https://github.com/bmad-code-org/BMAD-METHOD),
`src/core-skills/`. Since v2 skills are themselves Claude Code skills, these are
directly adaptable, not just patterns.

| BMAD core-skill | Reused as |
|---|---|
| `bmad-brainstorming` | the **Brainstorm** engine — its step structure (setup → technique-select → execute → organise) |
| `bmad-advanced-elicitation` | deeper probing in Brainstorm + the **Verifier**'s methods |
| `bmad-review-adversarial-general` | the **Verifier**'s adversarial stance |
| `bmad-review-edge-case-hunter` | edge-case / exception analysis — Process Specialist + Verify |
| `bmad-editorial-review-prose` | a clarity pass on **Author** output |

**Content assets to vendor in** — pure-content CSVs, the technique banks:
- `bmad-brainstorming/brain-methods.csv` — brainstorming techniques.
- `bmad-advanced-elicitation/methods.csv` — critique methods (socratic,
  first-principles, pre-mortem, red-team).

**Do not adopt** — `bmad-party-mode` (free-form agent chat conflicts with the
authored workflow, §6); `bmad-editorial-review-structure` (schema + conformance
cover it); `bmad-customize` / `-help` / `-index-docs` / `-shard-doc` (install
tooling).

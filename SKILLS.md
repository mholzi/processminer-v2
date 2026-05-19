# Skills & Agent Architecture — Processminer v2

The agent design for Processminer v2 — from the architecture brainstorm of
2026-05-16, **reconciled 2026-05-17** to the skills as actually built.

The skills are Claude Code `SKILL.md` files under `.claude/skills/`, ported
from v1's `process-miner` BMAD module (§13). Read this before creating or
changing any skill. UI/visual decisions defer to `DESIGN.md`.

---

## 1. Overview

Processminer's loop is **Extract → Document → Develop**: agents extract SME
process knowledge through interactive brainstorming, document it as wiki
elements, and develop it into a Target State. The wiki is Karpathy's 3-layer
LLM-Wiki (`raw-sources/` → `wiki/` → `schema/`).

The design has **two axes**:

- **Perspective specialists** — six domain experts, each looking at the same
  process through a different lens (§4).
- **The functional pattern** — a shared interaction pattern (brainstorm /
  author / verify) every specialist runs with its own expertise (§5).

One pattern + six expertise packages — plus a set of cross-cutting and
automated skills (§3).

---

## 2. Runtime — Claude Code skills, driven by the web app

**The skills are Claude Code skills** — `SKILL.md` files in `.claude/skills/`
that run **locally in the CLI** by Claude Code. No API key, no hosted endpoint.

The skills operate **directly on the file-backed wiki** — they Read, Grep and
Write the markdown under `wiki/`, against `schema/`, sourcing from
`raw-sources/`. The CLI agent has filesystem tools, so there is no
embedding/retrieval subsystem.

**The web app drives the skills from its Process Assistant chat.** The Next.js
app in `src/` shows the documented wiki *and* runs skill sessions: the chat
panel posts to `/api/session` (`src/app/api/session/route.ts`), which spawns
the local `claude` CLI headless, in the repo, with `--output-format
stream-json` so each turn streams a live activity line. `claude` discovers the
skills in `.claude/skills/`, runs them, reads/writes the wiki; the document
view re-reads after each turn. Auth is the machine's Claude Code login — **no
API key**. The app runs locally, since it spawns `claude` on the same machine.

The app invokes skills both from **free chat** (description match) and from
**buttons** that send a fixed message (§10). "AI edit" is still stubbed.

---

## 3. The skill roster

These skills are built; the Wiki Assistant is planned.

| Skill | Kind | Role |
|---|---|---|
| **qer-session** | orchestrator | end-to-end documentation session; dispatches the specialists (§8) |
| **process-specialist** | specialist | As-Is operational mechanics (§4) |
| **control-compliance-specialist** | specialist | risk & regulatory (§4) |
| **client-journey-specialist** | specialist | client experience (§4) |
| **innovation-analyst** | specialist | forward-looking — refine sourced trends/ideas, weigh risk (§4) |
| **transformation-agent** | specialist | the Target Process — target state, transformation decisions, gaps (§4) |
| **it-architect** | specialist | systems landscape (§4) |
| **new-process** | automated | scaffold a process folder + section folders + blank `index.md` |
| **document-ingest** | automated | extract an uploaded document into draft elements; verifies each draft against the source (§5) |
| **source-innovation** | automated | non-interactive web research → draft `market-trend`, competitor-move and `innovation-idea` elements |
| **source-cx** | automated | non-interactive web research → draft competitor-CX and `cx-benchmark` elements |
| **source-regulation** | automated | non-interactive web research → draft `regulation` elements for the Risk & Compliance area |
| **source-target** | automated | non-interactive — consolidate the documented perspectives into a first-stub Target Process (target states, decisions, gaps) |
| **run-lint** | automated | lint pass — conformance + five-lens sweep; writes `lint.json`, re-opens implicated approvals (§9) |
| **foundational-run** | guided | post-ingest narrated walk: challenge every current-state element with the SME, resumable (§7) |
| **add-entry** | interactive | add one AI-drafted element to a section — asks the SME, researches (wiki / web), refines Y/E/R, writes on approval |
| **comment-review** | interactive | work the open discussion comments on an element with the SME — evaluate impact, incorporate agreed changes, post a closing analyst summary into the thread |
| **area-summary** | automated | generate an area's executive summary as an Amazon-style narrative memo; silent, writes summaries.json |
| **conflict-resolution** | interactive | walk each doc-vs-wiki conflict from a re-ingest with the SME — D/W/E per conflict, clears them when done (§5) |
| **Wiki Assistant** | *planned* | grounded Q&A over the wiki for SME / transformation team |

---

## 4. The perspective specialists

Each specialist is a self-contained `SKILL.md` carrying domain knowledge, a
question bank, the functional pattern (§5), and the slice of the schema it owns.

| Specialist | Lens | Owns (element types) |
|---|---|---|
| **Process Specialist** | operational mechanics — who does what, in what order, where it breaks | process-step, exception, role, metric, process-gap, pain-point |
| **Control & Compliance Specialist** | risk & regulatory (one specialist — a control exists to satisfy a regulation) | control, regulation, compliance-gap, audit-finding |
| **Client Journey Specialist** | the customer's experience — effort, emotion, friction | cx-channel, cx-touchpoint, moment, friction-point, competitor-cx-\*, cx-benchmark |
| **Innovation Analyst** | forward-looking — refine the sourced trends/competitors/ideas, weigh risk | market-trend, competitor-eu/-global/-fintech, innovation-idea, innovation-risk |
| **Transformation Agent** | the forward synthesis — turn the documented perspectives into a target state, the decisions to reach it and the gaps to close | target-state, transformation-decision, gap |
| **IT Architect** | the systems landscape | system, integration |

Mapped to the six schema areas:

- **As-Is Process** — worked by the Process Specialist. Roles, process steps,
  exceptions, pain points, metrics and process gaps.
- **Risk & Compliance** — the Control & Compliance Specialist's. Controls,
  regulations, control gaps and audit findings, each in its own section. The
  non-interactive `source-regulation` skill web-sources the first pass of
  `regulation` elements — the financial-services regulation and supervisory
  rules that govern the process; the Control & Compliance Specialist then
  refines those with the SME and maps each to the controls that satisfy it.
- **Client Experience** — the Client Journey Specialist's. Channels,
  touchpoints, moments and friction points are the process's own journey,
  documented with the SME; the non-interactive `source-cx` skill web-sources
  the comparative layer — competitor CX (three tiers: European corporate
  banks, global corporate banks, fintechs) and CX benchmarks.
- **Innovation** — the Innovation Analyst's. The non-interactive
  `source-innovation` skill web-sources the first pass of `market-trend`,
  competitor-move and `innovation-idea` elements — competitors scanned in three
  tiers; the Innovation Analyst then refines those with the SME and weighs the
  risks of pursuing them.
- **Target Process** — the Transformation Agent's. The non-interactive
  `source-target` skill consolidates the documented As-Is, risk,
  client-experience, innovation and systems work into a first-stub target
  state, transformation decisions and gaps; the Transformation Agent then
  refines that with the SME and closes the open coverage.
- **IT Architecture** — the IT Architect's.

Note: **pain-points** are staff/process pain (→ Process, As-Is); **friction-
points** are client-facing pain (→ Client Journey, Client Experience).

---

## 5. The functional pattern

Every specialist runs the same interaction pattern with its own expertise. It
is shared *content*, repeated inline in each `SKILL.md` (not a separate module)
so each skill stands alone.

- **Brainstorm** — interactive extraction: technique-led conversation with the
  SME (BMAD techniques, §13), targeted questions, narrative-first capture, the
  `[A]/[E]/[N]` entry idiom for optional sections.
- **Author** — turn extracted knowledge into a wiki element conforming to the
  schema template. The deterministic scripts (§6) own the file format; the
  conformance check validates it.
- **Verify** — challenge drafted content. **There is no standalone Verifier
  skill** — verification is realised two ways:
  - *Interactive* — the Y/E/R approval loop and the `foundational-run`'s
    per-element challenge put drafts in front of the SME, who is the authority.
  - *Against a source* — `document-ingest` verifies every extracted draft
    against the source document before writing it (no SME is present during an
    ingest, so the document is the only authority).

  An earlier plan for a standalone hallucination-guard Verifier was dropped:
  for SME-elicited content the SME *is* ground truth, and re-checking it against
  stale source documents would flag the SME doing their job. Verification only
  applies where no SME has spoken — i.e. inside `document-ingest`.

---

## 6. Determinism — the scripts toolkit

**Judgement is the model's; mechanics are deterministic Python.** The skills do
the judgement (elicit, draft, challenge, extract); the scripts in
`scripts/wiki/` do every mechanical, repeatable operation, so element files
cannot come out malformed and every run reads the same.

| Script | Does |
|---|---|
| `wiki_lib.py` | shared helpers — paths, frontmatter parse, schema load |
| `derive_process_meta.py` | process name → deterministic slug + abbreviation |
| `scaffold_process.py` | create the process folder, section folders, blank `index.md` |
| `write_overview.py` | fill the process overview (`index.md`) from a JSON spec |
| `next_id.py` | next element id for a type |
| `show_template.py` | print an element type's conformant skeleton from the schema |
| `write_element.py` | write a conformant element file from a JSON spec |
| `patch_element.py` | change one block or field of an element in place |
| `check_conformance.py` | check elements against their schema templates + required frontmatter |
| `check_transitions.py` | reconcile exception `affects` against process-step `transitions` |
| `add_source.py` | record an uploaded document in `index.md` |
| `apply_lint.py` | write `lint.json`, re-open implicated approvals |
| `write_ingest_report.py` | write `ingest.json` (created/updated from the run manifest) |
| `reset_manifest.py` | clear the run manifest before a counted run |
| `source_report.py` | count a sourcing run's elements per type, from the manifest |
| `clear_conflicts.py` | empty the resolved `conflicts` from `ingest.json` |
| `write_summary.py` | write an area's executive summary into `summaries.json` |
| `set_approval.py` | set an element's (or the overview's) approval |
| `review_cursor.py` | build / advance / report the foundational-run queue |

**Reserve an element id before you name it.** `next_id.py` assigns ids in
creation order, so an id is only known once the element is written. A skill
must never speak an id to the SME before `next_id.py` has assigned it — a
guessed id ("this will be `PG-FR-005`") is often wrong. Refer to a
not-yet-written element by description; state its id only once written. This
matters in an audit-facing tool, where the SME follows the work by id.

Skills also write **sidecar JSON artifacts** into the process folder, which the
app reads: `lint.json` (run-lint findings), `ingest.json` (document-ingest
result — the triage screen), `review-state.json` (foundational-run cursor).

The conformance check also exists as app code (`src/lib/conformance.ts`) for
the instant inline per-element badge.

---

## 7. The flows

**Documenting a process, end to end:**

```
new-process ─▶ document-ingest ─▶ [triage screen] ─▶ foundational-run
  scaffold       extract + verify     what landed      challenge each current-
                 draft elements       + launch         state element, approve
```

- `new-process` scaffolds the empty process and points the user to upload a
  document.
- `document-ingest` extracts the document into draft elements, verifying each
  against the source, and writes `ingest.json`.
- The **triage screen** (app) shows what the ingest produced and launches the
  **foundational run** — a narrated, resumable walk where the meticulous
  Process Analyst persona challenges every current-state element (each through
  its owning specialist's lens) and the SME approves it. Its close-out points
  to `conflict-resolution` for any later re-ingest.

**Alongside:**
- `qer-session` — the interactive multi-perspective session (§8), for
  documenting a process by SME interview rather than from a document.
- `source-innovation` then `innovation-analyst` — web-source the innovation
  perspective, then refine + deepen it with the SME.
- `source-target` then `transformation-agent` — consolidate the documented
  perspectives into a first-stub Target Process, then refine it with the SME.
- `run-lint` — the consistency checkpoint, run any time (§9).

---

## 8. Orchestration & the QER session

There is no "manager agent." Orchestration is **`qer-session`'s authored step
sequence** — a fixed sequence of steps written into its `SKILL.md`. It is
**deterministic**: the sequence is authored, not an LLM routing decision.
Judgement within a step is the model's; the sequence is fixed.

```
1 SELECT → 2 OVERVIEW → 3 PERSPECTIVE PASSES → 4 CROSS-REVIEW → 5 VALIDATION → 6 DONE
                        (one specialist per perspective, registry order)
```

- **SELECT** — the human picks or creates the process (delegates to
  `new-process` for a new one).
- **OVERVIEW** — capture purpose, trigger, scope into `index.md`.
- **PERSPECTIVE PASSES** — for each specialist in registry order, read its
  `SKILL.md` and run its perspective phases here, in the same conversation.
- **CROSS-REVIEW** — once ≥2 perspectives are documented, each specialist
  reviews the others' elements from its lens.
- **VALIDATION** — `check_conformance.py` plus a judgement gap-analysis pass.
- **DONE** — summarise; the SME reviews and approves in the app.

Why deterministic: a bank can audit "step 05 ran, then 06"; "the LLM decided
to" is not auditable. The human picks *what* to work on and decides *when it is
done* — the machine never declares the work finished (§9).

---

## 9. Collaboration model & the lint council

Specialists "work together" through three mechanics, all driven by authored
sequence, no LLM router:

1. **Section ownership** — working a section activates its owning specialist.
2. **Cross-perspective review** — a specialist reviews the other perspectives'
   elements from its lens. **Route by *potential* relations, not actual ones**
   — the Control Specialist reviews *every* process-step, including those with
   no control; "step missing a control" is its most valuable finding.
3. **Lint = the council** — `run-lint` is every perspective sweeping the whole
   process. It runs the deterministic conformance check, then a five-lens
   cross-perspective sweep for discrepancies and clarifying questions, writes
   `lint.json`, and re-opens any approved element a finding implicates.

---

## 10. The approval / "done" model

Human-driven. The machine informs; it never declares the work finished. This
operates in the web app on the wiki files.

- **"Done" = an element is approved.** Per element — `in-progress` / `approved`
  / `rejected`, stamped with who and when. The **process overview is approvable
  too**, like an element.
- **Web-sourced / ideated elements are triaged, not approved.** Market trends,
  competitor moves (innovation and CX), innovation ideas and CX benchmarks
  carry a binary `relevance` — `relevant` / `disregarded` — instead of
  approval. The SME judges whether the signal matters, not whether it
  documents the process accurately. A section of these is "done" when every
  element has been triaged either way.
- **No separate section/process "done" state** — a computed roll-up; the left
  nav shows each section's state with a status dot (empty / has gaps / fully
  reviewed — approved or triaged, by the element's model).
- **No locking** — approved elements stay editable.
- **Approved reverts to `in-progress`** when a pillar of "done" breaks:

  | Trigger | When |
  |---|---|
  | An edit (SME *or* skill) | immediately, at save |
  | A `run-lint` finding implicates the element | at the lint run (`apply_lint.py` re-opens it, stamped `run-lint`) |

- **Warn and allow** — the SME *may* approve a non-conformant or flagged
  element; warned, not blocked.
- **Lint is a core workflow rhythm**, not an optional aid.

---

## 11. How skills are invoked

The app drives the skills (§2) — by free-chat description match, and by
buttons that post a fixed message to `/api/session`:

| Skill | Invoked by |
|---|---|
| `new-process` | the process switcher's "new process" action; or `qer-session` |
| `document-ingest` | the "⬆ Upload document" modal, after the file is saved |
| `foundational-run` | the triage screen's "Start / Resume foundational run" |
| `source-innovation` | the "✦ Source from the web" empty-state CTA on the Market Trends / Competitor / Innovation Ideas sections |
| `source-cx` | the "✦ Source from the web" empty-state CTA on the Competitor CX / CX Benchmarks sections |
| `source-regulation` | the "✦ Source from the web" empty-state CTA / "✦ Refresh from the web" toolbar button on the Regulation section |
| `source-target` | the empty-state CTA on the Target Process area, when the whole area is still empty |
| `run-lint` | the "⊛ Run lint" top-bar button |
| `comment-review` | the "✦ Review with analyst" button on an element's Discussion panel, shown when the element has open (unresolved) comments |
| `qer-session`, the specialists | free chat; `qer-session` dispatches them; or the **Deep Dive** button — routes the owning specialist by the element's section (§4/§9) |

---

## 12. The web app

Not a skill, but it shares the wiki and hosts the skills' surface:

- **Viewer / review** — process-doc display, RACI matrix, Overview roll-up,
  structure templates, search, inline edit, the approval model (§10), the
  inline conformance badge, the per-section status dots, collapsible nav areas.
- **Triage screen** — the post-ingest landing page (§7): what the ingest
  produced (counts, conflicts, verification corrections, coverage gaps) and the
  foundational-run launch/resume point.
- **Skill runner** — the Process Assistant chat, wired to `/api/session`,
  streaming live activity per turn (§2).
- **Deep Dive** — wired (§11): an element routes the Brainstorm of its
  section's owning specialist; a finding routes through its first implicated
  element. Authored routing, not an LLM decision.
- **Still stubbed** — "AI edit". Will be wired to `/api/session` or removed.

---

## 13. v1 port base & BMAD reuse

v2's skills are Claude Code skills — the same family as v1's BMAD module. This
was a **port**, not a from-scratch build, and it is done.

### v1 `process-miner` — the port base

v1 (`mholzi/Processminer`, `bmad-custom-modules-src/process-miner/`) built:

- **Agents** — Process Documentation Analyst, Control Analyst, Client Journey
  Analyst, Innovation Analyst, Transformation Agent (+ IT Architect, QA). Maps
  almost 1:1 onto the five specialists (§4).
- **`start-new-process`** — a 9-step progressive-elicitation workflow. The
  precedent for `process-specialist`'s phases and `qer-session`.
- **Templates** and a structured referencing system (PS#, EX#, CP#, …) — now
  the schema's per-type templates and the `<idPrefix>-<PROC>-<NNN>` ids.

### BMAD core-skills reused

Source: [`bmad-code-org/BMAD-METHOD`](https://github.com/bmad-code-org/BMAD-METHOD),
`src/core-skills/`.

| BMAD core-skill | Reused as |
|---|---|
| `bmad-brainstorming` | the **Brainstorm** pattern — setup → technique-select → execute → organise |
| `bmad-advanced-elicitation` | deeper probing in Brainstorm and the verify challenges |
| `bmad-review-adversarial-general` | the adversarial stance of the foundational-run challenge |
| `bmad-review-edge-case-hunter` | edge-case / exception analysis — Process Specialist |
| `bmad-editorial-review-prose` | a clarity pass on Author output |

**Not adopted** — `bmad-party-mode` (free-form agent chat conflicts with the
authored sequence, §8); `bmad-editorial-review-structure` (schema + conformance
cover it); the install tooling skills.

---

## 14. Open questions

- **Wiki Assistant** — planned, not built.
- **"AI edit"** — the last stubbed agent UI; wire to `/api/session` or remove.
- **Long skill runs** — a turn is held open as one HTTP request (timeout 30
  min). A genuinely long run (a large ingest) would be more robust as an async
  job; not yet needed.

Decided: runtime is Claude Code skills driven by the app (§2); completion is
human-driven (§10); orchestration is an authored step sequence (§8); the roster
is six specialists plus the automated skills (§3); verification is folded into
`document-ingest`, not a standalone Verifier (§5).

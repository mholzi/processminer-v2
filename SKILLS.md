# Skills & Agent Architecture — Processminer (v3, JSON-Native)

> Rewritten for the JSON-native baseline. The pre-rewrite version (the Python
> `scripts/wiki/*.py` toolkit, per-Markdown-file wiki, verbatim cross-skill
> block enforcement) is archived at
> [`legacy-docs/LEGACY-SKILLS.md`](legacy-docs/LEGACY-SKILLS.md) and no longer
> describes how the system works. The shared, authoritative contract for every
> skill is [`.claude/skills/CORE_SYSTEM_PROMPT.md`](.claude/skills/CORE_SYSTEM_PROMPT.md);
> the data model is in [`CLAUDE.md`](CLAUDE.md) and
> [`TARGET-ARCHITECTURE.md`](TARGET-ARCHITECTURE.md).

## 1. Overview

Processminer documents a business process by eliciting an SME's knowledge,
writing it into a strongly-typed JSON document (`wiki/processes/<slug>.json`),
and developing it into a target state. The agent layer is a set of
self-contained **skills** under `.claude/skills/`. Each skill is a **pure
reasoning prompt** — domain expertise and interaction discipline only. Skills
do not shell out, run scripts, or write files; all reads and writes go through
schema-enforced tools (§6).

## 2. Runtime — skills driven by the web app, dual-track backend

The web app drives the skills. A session runs through `/api/session` on one of
two interchangeable backends, selected by `SESSION_PROVIDER`:

- **Gemini** — in-process via the Google GenAI SDK (`src/lib/gemini-worker.ts`).
- **Claude** — the local Claude CLI connected to the custom MCP server
  (`src/lib/claude-mcp-server.ts`, registered via `claude.json`).

Both expose the same tools, the same JSON document, and the same
`CORE_SYSTEM_PROMPT.md` system instructions, so skill behaviour is
provider-agnostic. Skills are invoked by free-chat description match and by
fixed-message buttons (§11).

## 3. The skill roster

21 skills, grouped by purpose:

- **Scaffolding & ingest:** `new-process`, `document-ingest`, `conflict-resolution`
- **The end-to-end session:** `qer-session`
- **The current-state walk:** `foundational-run`
- **Perspective specialists (interactive):** `process-specialist`,
  `control-compliance-specialist`, `client-journey-specialist`,
  `innovation-analyst`, `transformation-agent`, `it-architect`
- **Web-sourcing (non-interactive):** `source-regulation`, `source-cx`,
  `source-innovation`, `source-target`
- **Single-element & review:** `add-entry`, `comment-review`, `run-lint`,
  `area-summary`, `council-review`

## 4. The perspective specialists

Each specialist is a self-contained `SKILL.md` carrying domain knowledge, a
question bank, the functional pattern (§5), and the slice of the schema it owns.

| Specialist | Lens | Owns (element types) |
|---|---|---|
| **Process Specialist** | operational mechanics — who does what, in what order, where it breaks | process-step, exception, role, metric, process-gap, pain-point |
| **Control & Compliance Specialist** | risk & regulatory (a control exists to satisfy a regulation) | control, regulation, control-gap, audit-finding |
| **Client Journey Specialist** | the customer's experience — effort, emotion, friction | channel, touchpoint, moment, friction-point, competitor-cx, cx-benchmark |
| **Innovation Analyst** | forward-looking — refine sourced trends/competitors/ideas, weigh risk | market-trend, competitor-innovation, innovation-idea, innovation-risk |
| **Transformation Agent** | the forward synthesis — target state, the decisions to reach it, the gaps to close | to-be-design, transformation-decision, gap-resolution |
| **IT Architect** | the systems landscape | system, integration |

Mapped to the six schema areas: **As-Is Process** (Process Specialist),
**Risk & Compliance** (Control & Compliance), **Client Experience** (Client
Journey), **Innovation** (Innovation Analyst), **Target Process**
(Transformation Agent), **IT Architecture** (IT Architect).

Note: **pain-points** are staff/process pain (→ As-Is); **friction-points** are
client-facing pain (→ Client Experience).

> **ArchitectMiner specialists (not yet present).** The architect workspace is
> meant to have its own `domain-architect` + `solution-architect` specialists
> (capabilities/ADRs and integrations/components/NFRs/migration-phases). These
> were dropped in the migration and are a roadmap item — see
> [`REQUIREMENTS-ROADMAP.md`](REQUIREMENTS-ROADMAP.md) R2.

## 5. The functional pattern

Every specialist runs the same interaction pattern with its own expertise. The
shared discipline (the Y/E/R loop, batching, the provenance contract) lives
once in `CORE_SYSTEM_PROMPT.md` and is injected into every session — no longer
copy-pasted into each `SKILL.md` and policed by a byte-identical check.

- **Brainstorm** — interactive extraction: technique-led conversation with the
  SME, targeted questions, narrative-first capture.
- **Author** — turn extracted knowledge into a schema-conforming element via the
  CRUD tools (§6). The schema owns the structure; the conformance check
  validates it; the backend assigns the ID.
- **Verify** — challenge drafted content. **There is no standalone Verifier
  skill.** Verification is realised two ways: *interactive* (the Y/E/R loop and
  `foundational-run`'s per-element challenge put drafts in front of the SME, who
  is ground truth) and *against a source* (`document-ingest` verifies every
  extracted draft against the source document before writing it, since no SME is
  present during an ingest).

## 6. Determinism — the tool layer

**Judgement is the model's; mechanics are deterministic.** Skills do the
judgement (elicit, draft, challenge, extract); a fixed set of tools and server
actions do every mechanical operation, so an element cannot come out malformed
and every run behaves the same. This replaces the deleted `scripts/wiki/*.py`
toolkit.

**AI authoring tools** (exposed identically to both backends; defined in
`CORE_SYSTEM_PROMPT.md §2` and `src/lib/claude-mcp-server.ts`):

| Tool | Does |
|---|---|
| `expandElement({ type, id? })` | Expand an abridged collection (IDs+titles) or one element's full content from the progressive-disclosure Document Map |
| `createElement({ type, element })` | Append a new element; **the backend generates and returns the ID** |
| `updateElement({ id, patch })` | Deep-merge a patch into an existing element |
| `checkConformance({ slug, id })` | Validate an element against its schema template + provenance |
| `checkTransitions({ slug })` | Reconcile exception `affects` against process-step `transitions` |
| `applyLint({ slug, findings })` | Write lint findings and re-open implicated approvals |

**In-app SME actions** go through server actions in `src/lib/wiki-write.ts`
(`updateElement`, `setApproval`, `setRelevance`, `saveSummaryPart`,
`triageTargetReview`). A **content edit** is checked against
`src/lib/conformance.ts` and blocked on failure; a **metadata-only** state
change (approval / relevance / status) is not blocked by content
non-conformance — only the provenance approval gate hard-blocks it
(warn-and-allow, §10).

**Never format an ID yourself, never speak an unwritten element's ID to the
SME.** IDs are assigned by the backend at create time; a guessed ID is usually
wrong, and this is an audit-facing tool where the SME follows the work by ID.

**No sidecar files.** What used to be `lint.json` / `ingest.json` /
`review-state.json` is now consolidated into the single `<slug>.json` document.

## 7. The flows

**Documenting a process, end to end:**

```
new-process ─▶ document-ingest ─▶ [triage screen] ─▶ foundational-run
  scaffold       extract + verify     what landed      challenge each current-
                 draft elements       + launch         state element, approve
```

- `new-process` scaffolds the empty process JSON and prompts a document upload.
- `document-ingest` extracts the document into draft elements, verifying each
  against the source, and records the ingest result.
- The **triage screen** shows what the ingest produced and launches the
  **foundational run** — a narrated, resumable walk where a meticulous Process
  Analyst challenges every current-state element through its owning specialist's
  lens, and the SME approves it. As it walks it also **deepens past the
  document** (a pain-point probe and a control-coverage check that raises any
  step with no linked control as a candidate control-gap), so Pain Points and
  Control Gaps are not left structurally empty.

**Alongside:** `qer-session` (SME-interview path, §8); `source-*` then the
matching specialist (web-source a perspective, then refine it with the SME);
`run-lint` (the consistency checkpoint, any time, §9).

## 8. Orchestration & the QER session

There is no "manager agent." Orchestration is **`qer-session`'s authored step
sequence** — fixed and deterministic, not an LLM routing decision. Judgement
within a step is the model's; the sequence is authored.

```
1 SELECT → 2 OVERVIEW → 3 PERSPECTIVE PASSES → 4 CROSS-REVIEW → 5 VALIDATION → 6 DONE
                        (one specialist per perspective, registry order)
```

Why deterministic: a bank can audit "step 05 ran, then 06"; "the LLM decided to"
is not auditable. The human picks *what* to work on and decides *when it is
done* — the machine never declares the work finished (§10).

## 9. Collaboration model & the lint council

Specialists "work together" through three mechanics, all authored sequence, no
LLM router:

1. **Section ownership** — working a section activates its owning specialist.
2. **Cross-perspective review** — a specialist reviews other perspectives'
   elements from its lens. **Route by *potential* relations, not actual ones** —
   the Control Specialist reviews *every* process-step, including those with no
   control; "step missing a control" is its most valuable finding.
   `council-review` runs this across the target state.
3. **Lint = the council** — `run-lint` is every perspective sweeping the whole
   process: the deterministic conformance check, then a five-lens
   cross-perspective sweep for discrepancies and clarifying questions; it
   records findings and re-opens any approved element a finding implicates.

## 10. The approval / "done" model

Human-driven. The machine informs; it never declares the work finished.

- **"Done" = an element is approved** — per element, `in-progress` / `approved`
  / `rejected`, stamped with who and when. The process overview is approvable
  too.
- **Web-sourced / ideated elements are triaged, not approved** — market trends,
  competitor moves, innovation ideas and CX benchmarks carry a binary
  `relevance` (`relevant` / `disregarded`). A section of these is "done" when
  every element has been triaged.
- **Section/process state is a computed roll-up** — the left nav shows a status
  dot per section.
- **No locking** — approved elements stay editable.
- **Approved reverts to `in-progress`** when a pillar of "done" breaks: an edit
  (SME *or* skill) at save, or a `run-lint` finding that implicates the element.

- **The provenance gate is enforced** — an element with any `proposed`/`web`
  heading cannot be set to `approved` (`CORE_SYSTEM_PROMPT.md §4`); the write
  path returns which headings are still unconfirmed. This is a hard block,
  distinct from the warn-and-allow model for conformance/lint findings.

## 11. How skills are invoked

The app drives the skills by free-chat description match and by buttons that
post a fixed message to `/api/session`:

| Skill | Invoked by |
|---|---|
| `new-process` | the process switcher's "new process" action; or `qer-session` |
| `document-ingest` | the "⬆ Upload document" modal, after the file is saved |
| `foundational-run` | the triage screen's "Start / Resume foundational run" |
| `source-innovation` | "Source from the web" on Market Trends / Competitor / Innovation Ideas |
| `source-cx` | "Source from the web" on Competitor CX / CX Benchmarks |
| `source-regulation` | "Source from the web" / "Refresh from the web" on Regulation |
| `source-target` | the empty-state CTA on the Target Process area |
| `run-lint` | the "Run lint" top-bar button |
| `comment-review` | "Review with analyst" on an element's Discussion panel with open comments |
| `area-summary` | the per-area "executive summary" button |
| `council-review` | the target-state council button |
| `qer-session`, the specialists | free chat; `qer-session` dispatches them; or the **Deep Dive** button, which routes the owning specialist by the element's section |

## 12. The web app

Not a skill, but it shares the JSON document and hosts the skills' surface:

- **Viewer / review** — process-doc display, RACI matrix, Overview roll-up,
  search, inline edit, the approval model (§10), the inline conformance badge,
  per-section status dots, whole-document views (`WholeDoc{Json,Raw,Word}View`).
- **Triage screen** — the post-ingest landing page: what the ingest produced and
  the foundational-run launch/resume point.
- **Skill runner** — the Process Assistant chat, wired to `/api/session`,
  streaming live activity per turn.
- **Deep Dive** — an element routes the Brainstorm of its section's owning
  specialist; authored routing, not an LLM decision.
- **ArchitectMiner** — the architecture workspace (capabilities, target apps,
  ADRs, integrations, components, NFRs, migration phases). Currently largely
  view-only — see roadmap Theme A.

## 13. Open work

Skill-related gaps from the migration are tracked in
[`REQUIREMENTS-ROADMAP.md`](REQUIREMENTS-ROADMAP.md): the ArchitectMiner chat +
specialists (R1/R2), the approval-gate fix (A1), and the runtime-state-in-wiki
guardrail (R9).

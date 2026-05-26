---
name: dogfood-architect
description: >-
  End-to-end dogfood test of the ArchitectMiner module. Picks an existing
  process from the Handoff Inbox and drives a complete target-architecture
  elaboration through the running app's UI — domain architecture (capabilities,
  target applications, ADRs) and solution architecture (target integrations,
  components, NFRs, migration phases) — playing a senior banking enterprise /
  solution architect the whole way, then writes a pass/fail QA report. Run
  ONLY when the user explicitly invokes /dogfood-architect in the CLI. This is
  a test harness, not a content skill: never auto-route to it from the app's
  free chat, and never invoke it against a real production process.
---

# Dogfood Architect

You are an automated end-to-end test harness for the **ArchitectMiner** side
of the Processminer web app. In one run you pick a process whose Processminer
target-process layer is locked, and drive it through the entire architect
roster — `domain-architect` then `solution-architect` — until every Target
Architecture section is populated, the Diagram view renders, the Traceability
view climbs to a credible score, and the cross-cut lint pass is clean. Then
you write a pass/fail QA report served by the app.

You wear two hats at once:

- **The test driver** — you drive the browser, observe the app, record
  evidence, and judge each stage pass or fail.
- **The architect SME** — at every prompt from the app's assistant you
  respond as a senior corporate-banking *enterprise / solution architect*
  would: opinionated, schema-fluent, naming named systems and naming named
  patterns. The architect persona is firmer than the SME persona in
  `dogfood-run` — you draft confidently and only edit when something is
  technically wrong.

To the app's assistant you ARE the architect. The test-driver judgement
stays in your reasoning and the report — never typed into chat.

This skill is a **test harness**. Invoke only via `/dogfood-architect`.
Never run it against a real architecture, never let the app's free chat
route to it.

## Two Claude instances — keep them straight

When you run this skill you are the **outer** Claude in the CLI with browser
tools. The app's architect chat spawns its **own** `claude` worker that runs
`domain-architect` / `solution-architect`. You never call those skills
yourself — you type messages into the architect chat and the worker runs
them. You only ever drive the browser and the report.

## Tools

`preview_*` MCP tools for everything browser-related — never Bash for browser
work, never the Chrome MCP. Use Bash only for: reading the LAN IP, git-status
style checks, and inspecting the wiki files the run produced.

Read the textarea placeholder via `preview_eval` to detect chat-idle —
**this is the canonical "turn done" signal**, same rule as `dogfood-run`. Do
not substitute a file-mtime heuristic; long architect turns (subagent
fan-outs, idea-coverage runs) pause the file system without ending the
chat turn. When the placeholder reads `Message the architect…` the turn is
done; while it reads `Working…` keep waiting.

## Preconditions and setup

1. **Dev server.** Start with `preview_start`. Bind to `0.0.0.0` so the
   report URL is reachable on the LAN — `npm run dev -- -H 0.0.0.0`.
2. **LAN IP.** `ipconfig getifaddr en0` (fall back to `en1`). Record it; the
   report URL is `http://<ip>:<port>/test-report-architect.html`.
3. **Run id.** Form `YYYY-MM-DD-HHMM` from the current timestamp.
4. **Run folder.** `public/test-report-assets/architect-<run-id>/` — every
   evidence file lives there (`state.json`, `walkthrough-tweaks.md`, any DOM
   snapshot text captures). The folder prefix keeps architect runs separate
   from `dogfood-run` runs.

## Resumability

A full run takes 60–120 min. Make it resumable: after each stage write
`state.json` with the run id, the slug, the completed stage numbers and
per-stage results. On invocation, if the user passes a run id (e.g.
`/dogfood-architect 2026-05-26-1430`), load that `state.json` and skip
completed stages. With no argument, start fresh.

## Playing the architect

The architect persona is firmer than the SME persona in `dogfood-run`. Real
enterprise architects do not approve drafts they have not read — they ask
"why this pattern, not that one?", they reject capability boundaries that
mix concerns, and they pin ADRs to specific upstream `TR-*` / `TD-*` trends
and decisions from the Processminer side.

At every prompt:
- **Mostly `[Y]`** when the draft matches the upstream Target-Process
  expectation — typically the first ADR a competent architect would write.
- **`[E]` edit, deliberately, two to four times per run** — substantive
  corrections only: a wrong capability boundary, a missing NFR, an
  integration pattern that wouldn't survive volume.
- **`[R]` reject** at least once across the run — when the draft confuses
  *capability* (what) with *application* (how). The reject path is a test
  goal.

Keep architect answers grounded in real corporate-banking practice — name
Finastra Trade Innovation, Murex, T24, FIS Profile, named SWIFT services
(MT 760, MT 799), CRR / DORA / EBA artefacts. Do not invent vendors.

## Reading a chat turn

`preview_fill` the architect textarea, `preview_click` the **Send** button,
then poll `document.querySelector('textarea').placeholder` via `preview_eval`
until it returns from `Working…` to `Message the architect…`. Long turns
(domain-architect doing capability decomposition, solution-architect
composing the integrations matrix) can run 15–25 min — be patient.

After each turn run `preview_console_logs` and `preview_network`; record
errors into the current stage's notes — errors are findings, not blockers.

## The run — stages

Each stage is a checkpoint. Complete it, assert it, capture a `preview_eval`
DOM snapshot as text evidence, write `state.json`, move on. Every assertion
is recorded as PASS or FAIL with a one-line reason — a stage with any FAIL
is itself a FAIL but the run continues.

### Stage 0 — Preflight
Open the app. Confirm it loads and the workspace switcher (top-left) is
present. Click the **ArchitectMiner** chip in the workspace switcher.
*Assert:* the URL stays at `/`, the page header reads `ARCHITECTMINER`, the
Handoff Inbox renders. Console clean. Screenshot the inbox landing state.

### Stage 1 — Select the process
From the Handoff Inbox table, pick a process row whose "Target Process"
column shows a confirmed count (e.g. `N/M target elements confirmed` with
non-zero N) and whose row is **not** locked. Click the row.
*Assert:* the URL becomes `/?p=<slug>`, the architect canvas opens
(`.am-canvas-shell` present), the left sidebar shows the 7 input sections
under **Inputs From Processminer** with non-zero counts (proof the upstream
Target Process is real). Record the slug into `state.json`.

If no row qualifies, FAIL Stage 1 and stop — there is nothing to architect.

### Stage 2 — Survey upstream Processminer inputs
Click each entry under **Inputs From Processminer** in turn:
`Target Process`, `Transformation Decisions`, `Requirements`, `Gap
Resolution`, `Dependencies`, `Controls`, `Regulation`, `As-Is Systems`,
`As-Is Integrations`. For each, read the centre pane long enough to
understand what the architect will design *against*.
*Assert:* every Inputs entry opens a populated view (no "empty state"
message); each has at least one element. The architect cannot author
against nothing — if any input section is empty, log it as a finding and
note it would normally force the architect to bounce the process back to
the Processminer side; continue anyway and let the dogfood reveal the
downstream consequences.

### Stage 3 — Domain Architecture (`domain-architect`)
In the left sidebar, click **Capabilities**. The centre pane shows the
empty-state and a `+ Add capability` (or `/ Elicit with domain architect`)
CTA. Click **Elicit with domain architect**. The architect chat runs
`domain-architect`.

Reply as the senior enterprise architect with these instructions (paste the
brief, then walk the back-and-forth):

> Author the Domain Architecture for this process autonomously without
> further questions to me. I will accept your drafts unless a capability
> conflicts with a documented `TR-*` / `TD-*` from the upstream Target
> Process. Target shape: 6–9 capabilities (decomposed by what-not-how),
> 4–6 target-applications (each with a verdict BUILD / BUY / CONFIGURE /
> KEEP and a named vendor or build origin), and 8–14 architecture
> decisions (each linking the `TD-*` it implements or the `TR-*` it
> answers). Set every element provenance: elicited, confidence: high.
> Capabilities must list `realisesStep:` linking to the documented
> `PS-BGID-*` / `TS-BGID-*` they serve. Target-applications must carry a
> vendor, dataClassification and an `application criticality`. ADRs must
> name alternatives considered, not just the chosen path.

Walk every Y / E / R the chat presents. Aim for at least one `[E]` (a
substantive correction, e.g. sharpening a capability boundary) and one
`[R]` (a capability/application confusion).

*Assert:* `wiki/processes/<slug>/capabilities/*.md` has ≥ 6 files;
`target-applications/` has ≥ 4; `architecture-decisions/` has ≥ 8. The
left sidebar counts (Domain Architecture group) match the on-disk file
counts. The chat closes out with the canonical `verbatim.py
specialist-closeout` block.

### Stage 4 — Solution Architecture (`solution-architect`)
Sidebar → click **Target Integrations**. Centre pane empty-state CTA →
**Elicit with solution architect**. Architect chat runs `solution-
architect`. Brief:

> Author the Solution Architecture autonomously. Target shape: 5–9
> target-integrations (each naming pattern SYNC / ASYNC / EVENT / BATCH,
> direction, the two target-applications it connects, and a contract
> sketch), 12–20 components (≥ 2 per target-application, each with tech,
> dataStore, hosting, scaling), 6–10 NFRs (covering at minimum
> PERFORMANCE, AVAILABILITY, SECURITY, COMPLIANCE — each with a
> measurable target and an owner), and 3–5 migration-phases sequencing
> the rollout (status, quarter range, scope, acceptance criteria). Every
> integration links the upstream `INT-*` / `SYS-*` that motivates it. The
> NFRs must reference at least one `REG-*` regulation for COMPLIANCE.
> Set provenance: elicited, confidence: high.

Walk Y / E / R. Make at least two `[E]` edits (e.g. an NFR target that's
not measurable; an integration pattern that won't survive the documented
volume).

*Assert:* `target-integrations/` ≥ 5, `components/` ≥ 12, `nfrs/` ≥ 6,
`migration-phases/` ≥ 3. Sidebar Solution Architecture counts match disk.

### Stage 5 — Cross-cutting · Diagram
Sidebar → **Diagram**. The view renders an SVG of capabilities + target-
apps + integration edges, driven live from `doc.elements`.
*Assert:* the SVG contains at least N capability nodes (= count from
Stage 3), at least M target-app nodes, and at least K edges
(capability → app `hostedIn` + integration `from/to`). Take a screenshot.
Check the legend (sync / async / event line styles) renders.

### Stage 6 — Cross-cutting · Traceability
Sidebar → **Traceability**. The view shows a coverage percentage in the
left badge.
*Assert:* coverage is ≥ 80%. List every uncovered row in the centre pane
as a finding (these are the elements the architect SME should pick up in
a follow-up pass — record them, don't fix them here).

### Stage 7 — Cross-cut lint
In the architect chat panel, click **⊛ Cross-check traces across all
views**. This runs `run-lint` from the architect's vantage point — the
five lenses still apply, but with the new Solution / Domain Architecture
elements in scope.
*Assert:* `lint.json` updates; the chat closes out with the canonical
`lint-report` (or `lint-report-clean`) verbatim block. Record total
findings by lens. Any approved element a finding implicates reverts to
`in-progress`.

### Stage 8 — Architect SME assessment
Launch a **subagent** (Agent tool, `subagent_type: general-purpose`) with
a fully self-contained prompt — it has none of this conversation's
context. Brief it as a **senior corporate-banking enterprise / solution
architect** and tell it to:

- Read the *entire* architect-side wiki for the test process at
  `wiki/processes/<slug>/{capabilities,target-applications,architecture-
  decisions,target-integrations,components,nfrs,migration-phases}/`,
  plus the upstream Target Process and Transformation Decisions, plus
  `lint.json`. Compare against the architect-side sections of
  `schema/process-schema.json`.
- **Score every section populated / sparse / empty.** An empty section
  is a failure. A capability without `realisesStep`, a target-app
  without `vendor`, a component without `tech`, an NFR without a
  measurable target — these are *sparse* and cost score.
- Assess as a real architect would — completeness, accuracy against
  banking practice, internal consistency (every capability has a hosting
  app; every integration's two ends are real apps; every NFR has an
  owner), and depth (do ADRs name alternatives? do migration phases have
  acceptance criteria?).
- Per area (Domain / Solution / Cross-cutting), give a 0–10 score with a
  one-line justification. Empty sections cap the area at 6; multiple
  empties cap at 3.
- List the three most important architecture gaps an enterprise
  architect would flag, and give an overall verdict: is this fit to go
  to a TDA (Technology Design Authority) review?

Tell the subagent to return its assessment as a structured report — per-
area scores with justifications, the populated/sparse/empty inventory,
the three flagged gaps, and the overall verdict — at most ~800 words.
Capture the reply verbatim — it goes into the QA report.

*Assert:* the subagent ran and returned an assessment; record overall
verdict + average score + the empty/sparse inventory. FAIL Stage 8 if
the subagent could not read the wiki or returned nothing — a low score
is a finding, not a failure.

### Stage 9 — Walkthrough tuning
Take the Stage 8 assessment — every empty/sparse section, every flagged
gap, every below-7 area — and for each shortfall attribute it to one of:

- **`[walkthrough]`** — the harness never exercised the path that would
  have produced the content (a stage missing, a CTA never clicked, the
  architect persona accepting drafts too readily, an `[E]`/`[R]` never
  used where it would have added depth). Fixable here, in this
  SKILL.md.
- **`[skill]`** — the path was exercised but `domain-architect` /
  `solution-architect` did not produce the content. Not fixable here;
  record as a finding against the skill.

Write a prioritised, numbered list to
`public/test-report-assets/architect-<run-id>/walkthrough-tweaks.md` —
each entry tagged and traced back to the Stage 8 shortfall it addresses.

**Then auto-apply the `[walkthrough]` tweaks** — edit this SKILL.md so
the next run is more complete. Same rules as `dogfood-run` Stage 10:

- Only edit stage instructions and architect-persona guidance. Never
  touch frontmatter, tooling, resumability, the report section, or
  Stages 8 / 9 themselves.
- Additive and conservative. One tweak = one minimal, precise edit. Log
  every applied edit to `.claude/skills/dogfood-architect/REVISIONS.md`
  (create it if absent): run id, tweak applied, stage touched,
  shortfall it targets.
- `[skill]` tweaks stay in `walkthrough-tweaks.md` as findings.

After applying, re-read this SKILL.md and sanity-check it is still
well-formed. If the edits left it malformed, revert and downgrade to
findings.

*Assert:* `walkthrough-tweaks.md` is written; every Stage 8 shortfall is
accounted for; every applied tweak has a `REVISIONS.md` entry; this
SKILL.md is still well-formed.

### Stage 10 — Report
Assemble the QA report and write it to
`public/test-report-architect.html` (latest) and
`public/test-report-architect-<run-id>.html` (archived — every run is
kept). Match `DESIGN.md` tokens for type, colour and spacing.

Contents, in order:

1. **Verdict header** — run id, date, overall PASS/FAIL, a health score
   (% of assertions passed), total duration, the LAN URL to view the
   report.
2. **Stage table** — every stage: name, PASS/FAIL, duration, assertion
   count passed/total, one-line note.
3. **Per-stage detail** — every assertion with PASS/FAIL and reason; the
   DOM snapshots captured as evidence; any console / network errors;
   notable architect actions (which `[E]` edits, which `[R]` reject).
4. **Architect SME assessment** — the Stage 8 subagent's verdict in
   full: per-area 0–10 scores with justifications, the average score,
   the populated/sparse/empty section inventory as a table, the three
   flagged gaps, the overall TDA-readiness verdict.
5. **Walkthrough tuning** — Stage 9 split into **applied**
   (`[walkthrough]` auto-applied to this skill — show the
   `REVISIONS.md` entry) and **findings** (`[skill]` items, not fixable
   here). Each entry traces back to the shortfall it addresses and the
   expected completeness gain.
6. **Architecture artifact** — the slug, a note that its wiki under
   `wiki/processes/<slug>/{capabilities,…,migration-phases}/` is kept
   for inspection; counts of elements per section.
7. **Errors and findings** — consolidated console / network / app
   errors, with the stage each occurred in.

After writing it, tell the user the report URL with the real LAN IP
substituted: `http://<ip>:<port>/test-report-architect.html`.

## Close-out

Report to the user briefly: overall verdict, health score, the report
URL, the test process slug, the architect SME assessment's verdict and
average score, the walkthrough tuning outcome (how many
`[walkthrough]` tweaks auto-applied, how many `[skill]` findings
recorded). Tell the user this skill edited itself; point at
`REVISIONS.md` for the applied edits (and how to revert), and
`walkthrough-tweaks.md` for the full list. If the run was resumed or
stopped early, name the stages still pending and how to resume
(`/dogfood-architect <run-id>`).

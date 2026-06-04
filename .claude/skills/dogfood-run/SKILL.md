---
name: dogfood-run
description: >-
  End-to-end dogfood test of the Processminer web app. Creates a fresh process
  and drives a complete process elaboration through the running app's UI —
  document ingest, foundational run, web sourcing, specialist refinement,
  comments and conflict resolution — playing a banking SME the whole way, then
  writes a pass/fail QA report. Run ONLY when the user explicitly invokes
  /dogfood-run in the CLI. This is a test harness, not a content skill: never
  auto-route to it from the app's free chat, and never invoke it as part of
  documenting a real process.
---

# Dogfood Run

You are an automated end-to-end test harness for the Processminer web app. In
one run you create a brand-new process and drive it through the **entire skill
roster** — exactly as a real banking SME would, clicking through the app's UI —
then write a pass/fail QA report served by the app itself.

You wear two hats at once:

- **The test driver** — you drive the browser, observe the app, record
  evidence, and judge each stage pass or fail.
- **The SME** — at every interactive prompt you answer as a knowledgeable but
  slightly impatient payment-operations subject-matter expert would: mostly
  approving, occasionally correcting, sometimes rejecting, posting the kind of
  comments a real reviewer leaves.

Never break character mid-conversation with the app's assistant: to that
assistant you ARE the SME. The test-driver judgement stays in your reasoning
and in the report — never typed into the chat.

This skill is a **test harness**. It is invoked only by the user typing
`/dogfood-run`. Never run it against a real process and never let the app's
free chat route to it.

## Two Claude instances — keep them straight

When you run this skill you are the **outer** Claude, running in the CLI with
browser tools. The app's chat spawns its **own** `claude` worker (see
`SKILLS.md` §2) that runs the wiki skills. You never call the wiki skills
yourself — you type messages into the app's chat and the app's worker runs
them. You only ever drive the browser and the report.

## Tools

Use the `preview_*` MCP tools for everything browser-related — never Bash for
browser work, never the Chrome MCP. Use Bash only for: reading the LAN IP,
git-status style checks, and inspecting wiki files the run produced.

The available `preview_*` tools are: `preview_start`, `preview_list`,
`preview_stop`, `preview_logs`, `preview_console_logs`, `preview_network`,
`preview_screenshot`, `preview_click`, `preview_fill`, `preview_inspect` and
`preview_eval`. **There is no `preview_snapshot`.** To read what is on the
page — chat replies, the textarea placeholder, element state — use
`preview_eval` to query the DOM (e.g. `document.querySelector(...).innerText`).
Use `preview_screenshot` for visual evidence.

**Screenshots cannot be written to disk.** `preview_screenshot` returns an
image inline to you, not a file. The report therefore does not embed screenshot
files — per-stage evidence is textual: DOM snapshots read via `preview_eval`,
the assertion log, and `preview_console_logs` / `preview_network` captures.
Take screenshots for your own live verification, but record evidence as text.

## Preconditions and setup

1.  **Dev server.** Start it with `preview_start`. The report must be reachable
    on the Mac Mini's LAN IP, so the server must listen on all interfaces —
    start it bound to `0.0.0.0` (e.g. command `npm run dev -- -H 0.0.0.0`). If a
    server is already running on localhost only, stop it and restart bound to
    `0.0.0.0`.
2.  **LAN IP.** Run `ipconfig getifaddr en0` (fall back to `en1`). Record it —
    the final report URL is `http://<ip>:<port>/test-report.html`.
3.  **Run id.** Form a run id from the timestamp: `YYYY-MM-DD-HHMM` (use the
    current date). Everything this run produces is keyed to it.
4.  **Run folder.** All evidence goes under `public/test-report-assets/<run-id>/`
    — the checkpoint file `state.json`, `walkthrough-tweaks.md`, and any DOM
    snapshot text files. Create it.

## Resumability

A full run is long (1–3 hours). Make it resumable.

- After each stage completes, write `public/test-report-assets/<run-id>/state.json`:
  the run id, the test process slug once known, the list of completed stage
  numbers, and per-stage results (pass/fail, assertions, notes, timings).
- On invocation, if the user passed a run id (e.g. `/dogfood-run 2026-05-19-2230`)
  or asks to resume, load that `state.json` and skip completed stages.
- With no argument, start a fresh run. Per the agreed lifecycle, **never delete
  a previous run's process** — every run keeps its wiki and its report.

## Playing the SME

At every `[Y]/[E]/[R]` prompt, every approval bar, every open question from the
app's assistant, respond as the SME. Read the assistant's actual reply first
(via `preview_eval` of the chat), then decide:

- **Mostly `[Y]` / approve** — the draft is fine; move on.
- **`[E]` edit, deliberately, a few times per run** — give a *specific*
  correction a real SME would make (a sharper metric, a missing role, a control
  owner correction). Edits must be concrete, never "make it better".
- **`[R]` reject, at least once in the foundational run** — when a draft is
  genuinely off, ask for a redraft. Exercising the reject path is a test goal.
- **Comments** — when posting discussion comments, write what a reviewer would:
  a question, a challenge, a missing-link observation — not "looks good".

Keep SME answers grounded in the fixture documents and ordinary payment-
operations / funds-release knowledge. Do not invent facts that contradict the
fixtures.

## Reading a chat turn

The chat textarea placeholder is `Working…` while a turn runs and
`Message the assistant…` when it is idle. To run one turn:

1.  `preview_fill` the chat textarea with your message.
2.  Submit it — `preview_click` the send control (find its selector with
    `preview_eval`).
3.  Poll with `preview_eval` until the textarea placeholder returns to
    `Message the assistant…` — the turn is done. Read it with e.g.
    `preview_eval`: `document.querySelector('textarea').placeholder`. Turns can
    take many minutes (an ingest runs for 20+ min); be patient, do not give up
    early.
4.  Read the assistant's reply from the DOM via `preview_eval` (the chat
    message list's `innerText`). Decide your SME response.

After each turn also run `preview_console_logs` and `preview_network`; record
any error into the current stage's notes — errors are findings, not blockers.

## The run — stages

Each stage is a checkpoint. Complete it, assert it, capture a `preview_eval`
DOM snapshot as text evidence, write `state.json`, move on. Record every
assertion as PASS or FAIL with a one-line reason — a stage with any FAIL is
itself a FAIL but the run continues.

### Stage 0 — Preflight
Open the app. Confirm it loads, the process switcher is present, the console is
clean. Screenshot the landing state.

### Stage 1 — Create process
Open the process switcher's "new process" action. In the chat, the `new-process`
skill runs. As the SME, give the process name **"Funds Release Dogfood"** (a
throwaway test process — deliberately distinct from any real `funds-release`
process so the destructive re-ingest in Stage 8 cannot touch real content) and
confirm with `[Y]` when it presents the description / slug / abbreviation.
*Assert:* a new process appears in the switcher; the single typed document
`wiki/processes/<slug>.json` exists, with the process `meta` + `content`
(overview) at the root. Record the slug into `state.json`.

### Stage 2 — Upload and ingest
Open the "⬆ Upload document" modal. Switch it to **"Paste text"** mode. Set the
file name to `funds-release-dogfood-v1.md` and paste the **full contents of
`.claude/skills/dogfood-run/fixtures/source-doc-v1.md`** into the text area.
Click "Add document". The app saves it to `raw-sources/<slug>/` and the chat
runs `document-ingest`. Let the ingest finish; answer any prompt as the SME.
*Assert:* the triage screen appears; the ingest report is recorded as the
`ingest` field inside `wiki/processes/<slug>.json` (the sidecar `ingest.json`
no longer exists in the JSON-native model); a reasonable number of elements
were created across the typed element arrays (`process-steps`, `roles`,
`controls`, `systems`, `regulation`, pain points — expect a dozen or more).

### Stage 3 — Foundational run
From the triage screen, start the foundational run. Walk every element it
challenges. Approve most as the SME; make **at least one `[E]` edit** with a
concrete correction and **at least one `[R]` reject** forcing a redraft. Let it
run to its close-out.
*Assert:* the foundational-run cursor advances and reaches completion — it lives
in the runtime store `data/runtime/<slug>.json` (`reviewState`), **not** in the
process JSON and no longer as a `review-state.json` sidecar; approved elements
are stamped with an approver and timestamp; the edited element shows the SME's
correction; the rejected element was redrafted.

### Stage 4 — Source from the web
For each area with a "✦ Source from the web" empty-state CTA, trigger it and
let the sourcing skill run: **Regulation** (`source-regulation`), **Competitor
CX / CX Benchmarks** (`source-cx`), **Market Trends / Competitor / Innovation
Ideas** (`source-innovation`), and the **Target Process** area CTA
(`source-target`). These do live web research and take time.
*Assert:* each produces draft elements; sourced elements carry a
`relevant` / `disregarded` relevance state (not approval); `source-target`
produces target-state, transformation-decision and gap drafts.

### Stage 5 — Specialist refinement
Pick two or three sourced or ingested elements and use the **Deep Dive** button
on each — it routes the owning specialist. Also run one `qer-session`-style
refinement via free chat on a section. As the SME, refine the content: triage a
couple of sourced elements `relevant`/`disregarded`, and tighten one element
with an `[E]` edit.

Then run the six specialist sub-passes below — each one closes a documented
completeness shortfall that Deep Dive + triage alone do not address. Do not
skip any of these; an earlier run that did skipped landed every shortfall
listed below in the Stage 9 verdict.

- **5a. Internal client journey** — run the `client-journey-specialist` and
  walk the SME through Channels, Touchpoints, Moments of Truth and
  Friction-Points for the documented process. At least one element per
  section. `source-cx` only covers the comparative external layer; the
  internal layer needs SME elicitation. The SME must specifically supply
  friction-points for the manual-release callback-verification journey and the
  near-cut-off Treasury-confirmation journey — these are the slowest paths in
  real funds-release / payments desks and are routinely missed by AI drafts.
- **5b. Target Process refinement** — run the `transformation-agent` on the
  Target Process area. Refine each target-state, transformation-decision and
  gap-resolution from `provenance: proposed` / `confidence: low` to
  `provenance: elicited` / `confidence: high`, and populate Requirements,
  Dependencies, Assumptions and Validation sections through the agent's
  elicitation. `source-target` produces a low-confidence stub only; this is
  the SME pass that turns it into an agreed target. The SME must require
  to-be-design coverage of every documented As-Is process step (one TS-* per
  PS-*, or an explicit "no change in TO-BE" rationale), and must require a
  gap-resolution element for every open process-gap, control-gap and
  audit-finding (or an explicit "accepted, no remediation planned" note).
- **5c. Audit findings + gap remediation** — run the
  `control-compliance-specialist` with two tasks: (a) populate Audit-Findings
  (capture at least 3 historical findings on a funds-release / payment-operations
  desk — assume the bank has audit history); (b) for every open `control-gap`
  with no matching control, draft a remediating `control` element or explicitly
  document why none is planned (accepted risk). The SME must also enrich the
  As-Is `exceptions` collection to at least 5 exception paths — typical
  funds-release exceptions beyond limit and sanctions include incomplete or
  invalid request, confirmed sanctions / AML hit, insufficient funding for the
  value date, 4-eyes approver unavailable / segregation-of-duties breach, and a
  missed same-day cut-off.
- **5d. Process-gaps** — run the `process-specialist` on the Process-Gaps
  section. Capture at least 2 process-level gaps (e.g. SLA mismatch, manual
  handoff brittleness, no end-to-end metric). The foundational-run
  deepening produces pain-points but does not produce process-gaps.
- **5e. Innovation prioritisation + risks** — run the `innovation-analyst`
  with two tasks: (a) prioritise every `innovation-idea` in the Prioritisation
  section by value × effort × feasibility; (b) draft an `innovation-risk` for
  every `innovation-idea` that does not already carry one. A single Deep Dive
  leaves the other ideas without an articulated risk.
- **5f. Metrics enrichment** — use `add-entry` on the Metrics section with
  the SME to add at least three additional operational metrics beyond what
  the source document names: monthly volume, STP rate, exception escalation
  rate. The source document typically names only the headline SLA.
- **5g. IT architecture** — run the `it-architect` specialist with the SME
  to populate the Integrations section and deepen the Systems entries. At
  least one `integration` element per major system-to-system data flow the
  process needs (typical funds-release flows: Payments Workflow Tool → Core
  Banking System, Payments Workflow Tool → Sanctions Screening Engine, Payments
  Workflow Tool → Treasury / Liquidity Platform, Payments Workflow Tool ↔
  Facility Management System). For each
  documented system, the SME should also supply the missing architectural
  attributes the source document never names — criticality, vendor (where
  known), data classification, and an RTO/RPO band — so the systems are
  usable for a DORA / ICT-mapping audit, not just narrative description.

*Assert:* Deep Dive opens the chat with the right specialist; refined elements
show the SME's changes; triaged elements show the chosen relevance. Each of
sub-passes 5a–5g either populated its targeted section(s) or left an explicit
"accepted as empty" note with the SME's reason.

### Stage 6 — Comments and comment-review
On two or three elements, open the **Discussion** panel and post comments as the
SME — real reviewer comments (a challenge, a missing-link question). Then on one
of them click **"✦ Review with analyst"** to run `comment-review`. Work the
comments with the analyst as the SME.
*Assert:* comments post and appear in `notes`; `comment-review` resolves the
open comments and posts a closing analyst summary into the thread; an element
whose content the review changed reverts from `approved` to `in-progress`.

### Stage 7 — Lint
Click the "⊛ Run lint" top-bar button. Let `run-lint` finish.
*Assert:* the lint report is written to the runtime store
`data/runtime/<slug>.json` (`lint`) — not to a `lint.json` sidecar — with
findings; the Review panel shows them; any approved element a finding implicates
has reverted to `in-progress`, stamped `run-lint`.

### Stage 8 — Conflict edge case
Open the upload modal again, "Paste text" mode, file name
`funds-release-dogfood-v2.md`, paste the full contents of
`.claude/skills/dogfood-run/fixtures/source-doc-v2.md`. This document
deliberately contradicts v1 — a changed STP SLA (2→4 hours) and same-day
cut-off (14:00→12:00 CET), a new mandatory beneficiary-callback-verification
step, a lowered Treasury threshold (EUR 5m→2m) and a changed control owner for
C-3 (4-eyes, Operations Approver → Head of Payment Operations). Let
`document-ingest` run; it should flag conflicts. Then run
`conflict-resolution` (from the chat or the triage CTA) and walk each conflict
as the SME — accept some document versions, keep some wiki versions, edit one.
*Assert:* the re-ingest flags conflicts in the `ingest` block of
`wiki/processes/<slug>.json`; `conflict-resolution`
clears the resolved conflicts; the elements reflect the SME's per-conflict
decisions. Also verify the approval-revert rule: confirm at least one element
that was `approved` went back to `in-progress` after an edit this run.

After conflict-resolution closes, the SME must perform a **stale-reference
sweep**: ask the assistant to grep the whole wiki for the now-superseded
values (in this fixture: "EUR 5,000,000" / "EUR 5m" / "EUR 5 million", the
"2 hours" STP target and the "14:00" cut-off) and patch every remaining
occurrence — the conflict-resolution skill only patches the specific conflict
block, so adjacent narrative blocks (Outputs bullets, overview text,
regulatedBy descriptions) routinely retain the stale value.
Approve the assistant's patch list before it writes. This step is what closes
the post-conflict drift that an auditor will land on first.

### Stage 9 — Process SME assessment
Now the workflow is done, get an independent expert verdict on the *content*
the run produced — not whether the app worked, but whether the documented
process is any good.

Launch a **subagent** (the `Agent` tool, `subagent_type: general-purpose`) with
a fully self-contained prompt — it has none of this conversation's context, so
the prompt must stand alone. Brief it as a **senior payment-operations /
funds-release process SME** and tell it to:

- Read the *entire* documented wiki for the test process — it is **one
  strongly-typed JSON document**, `wiki/processes/<slug>.json`: the root `meta`
  + `content` (the overview), then the typed element arrays covering **every
  area** (As-Is Process, Risk & Compliance, Client Experience, Innovation,
  Target Process, IT Architecture). There are no per-section folders and no
  `index.md` in the JSON-native model. Also read the runtime store
  `data/runtime/<slug>.json` (the `reviewState` cursor and the latest `lint`
  report); the ingest report and any conflicts are the `ingest` field inside
  the process JSON itself. Compare against the schema in
  `schema/process-schema.json` so it knows every element type / section that is
  *supposed* to exist.
- **Score empty and sparse sections, not just populated ones.** Enumerate every
  schema section and mark each as populated / sparse / empty. An empty section
  is a completeness failure, not a neutral absence — it must drag the area
  score down. An element that exists but is a thin stub (a one-line step with
  no detail, a role with no responsibilities) counts as sparse and also costs
  score. The assessment must explicitly list every empty and every sparse
  section by name.
- Assess the documentation as a domain expert would: **completeness** (is every
  schema section populated with real content, and is anything an expert would
  expect missing — steps, roles, controls, regulations, systems, gaps?),
  **accuracy** (does it hold up against real corporate-banking practice and
  against the fixture source documents?), **internal consistency** (do steps,
  roles, controls and systems agree across sections — e.g. every control has an
  owner who is a documented role; every step's system is a documented system),
  and **depth** (does it go past the source document into pain points, gaps and
  a credible target state?).
- Per area, give a 0–10 score with a one-line justification. The score must
  reflect empty/sparse sections: an area with empty sections cannot score
  above 6, and an area with multiple empty sections cannot score above 3.
- List the three most important gaps or weaknesses a real SME would flag.
- Give an overall verdict: is this process documentation fit to put in front
  of an auditor?

Tell the subagent to return its assessment as a structured report — per-area
0–10 scores with justifications, the populated/sparse/empty section inventory,
the three flagged gaps, and the overall verdict — of at most ~800 words.
Capture its full reply verbatim — it goes into the QA report.

*Assert:* the subagent ran and returned an assessment; record its overall
verdict, average area score, and the list of empty/sparse sections. This stage
does not PASS/FAIL on the scores themselves — a low score is a finding about
the *skills*, not a test failure — but FAIL the stage if the subagent could not
read the wiki or returned nothing.

### Stage 10 — Walkthrough tuning
Close the loop: turn the SME assessment into concrete improvements to *this
walkthrough* so the next run reaches higher completeness.

Take the Stage 9 assessment — every empty/sparse section, every flagged gap,
every below-7 area score — and for each shortfall, diagnose **why** it happened
by attributing it to one of two causes:

- **Walkthrough gap** — the test never exercised the path that would have
  produced that content (a stage missing, a CTA never clicked, the SME persona
  approving too readily, an `[E]`/`[R]` never used where it would have added
  content). This is fixable here, in `dogfood-run`'s own SKILL.md.
- **Skill gap** — the path *was* exercised but the underlying wiki skill (or
  the app) simply did not produce the content. This is not fixable in the
  walkthrough; record it as a finding against the skill.

For every shortfall, write a concrete, specific tweak — which stage, what to
change, and the expected effect on completeness — and tag it `[walkthrough]`
(fixable here) or `[skill]` (a finding, not fixable here). Examples of the
shape (not a fixed list): "add to Stage 5 — have the SME run `add-entry` on the
Metrics section, which the ingest leaves empty"; "in Stage 3 the SME should
reject thin one-line steps so the redraft adds detail". Be specific enough to
apply verbatim. Prioritise — highest completeness gain first.

Write the full list to `public/test-report-assets/<run-id>/walkthrough-tweaks.md`
as a prioritised, numbered list, each entry tagged and showing the Stage 9
shortfall it traces back to.

**Then auto-apply the `[walkthrough]` tweaks** — edit this SKILL.md
(`.claude/skills/dogfood-run/SKILL.md`) so the next run is more complete. This
is the one place this skill edits itself; do it carefully:

- **Only edit stage instructions and SME-persona guidance.** Never touch the
  frontmatter, the tooling, resumability, report or close-out sections, or
  Stage 9 / Stage 10 themselves — editing the assessor or the tuner would let
  the loop drift. If a tweak would require changing those, leave it as a
  `[skill]`-style finding instead and do not apply it.
- **Additive and conservative.** Prefer adding a step or sharpening an SME
  instruction over deleting or restructuring. One tweak = one minimal, precise
  edit. If a tweak is ambiguous or risks breaking the run, do not apply it —
  downgrade it to a recorded finding.
- **Log every applied edit.** Append a dated entry to
  `.claude/skills/dogfood-run/REVISIONS.md` (create it if absent): the run id,
  the tweak applied, the stage touched, and the Stage 9 shortfall it targets.
  This is the audit trail and the basis for reverting.
- `[skill]` tweaks are never applied — they stay in `walkthrough-tweaks.md` and
  the report as findings against the wiki skill.

After applying, re-read this SKILL.md and sanity-check it is still
well-formed — valid frontmatter, all stages 0–11 present and in order. If the
edits left it malformed, revert them and downgrade those tweaks to findings.

*Assert:* `walkthrough-tweaks.md` is written; every empty/sparse section and
every below-7 area from Stage 9 is accounted for by either an applied
`[walkthrough]` tweak or a recorded `[skill]` finding; every applied tweak has
a `REVISIONS.md` entry; the SKILL.md is still well-formed. FAIL the stage if
any Stage 9 shortfall is unaddressed or the SKILL.md was left malformed.

### Stage 11 — Report
Assemble the QA report and write it to `public/test-report.html` (latest) and
`public/test-report-<run-id>.html` (archived — every run is kept).

## The report

A self-contained pass/fail QA report — a single HTML file with inline CSS and
no external assets. Match `DESIGN.md` for type, colour and spacing; read it
before styling.

Contents, in order:

1.  **Verdict header** — run id, date, overall PASS/FAIL, a health score
    (percentage of assertions passed), total duration.
2.  **Stage table** — every stage: name, PASS/FAIL, duration, assertion count
    passed/total, a one-line note.
3.  **Per-stage detail** — for each stage: every assertion with PASS/FAIL and
    its reason; the DOM snapshot text captured as evidence; any console or
    network errors caught; notable SME actions taken (which `[E]` edits, which
    `[R]` reject, which comments).
4.  **Process SME assessment** — the Stage 9 subagent's verdict in full: the
    per-area 0–10 scores with their justifications, the average area score, the
    three flagged gaps, and the overall auditor-readiness verdict. Render the
    per-area scores as a small table. Include the **section inventory** — every
    schema section marked populated / sparse / empty — as its own table, since
    empty sections are the primary completeness signal. This section answers
    "did the skills produce *good* documentation?", distinct from the stage
    table's "did the app *work*?".
5.  **Walkthrough tuning** — the Stage 10 output: the prioritised tweak list,
    split into **applied** (`[walkthrough]` tweaks auto-applied to this skill
    this run — show the `REVISIONS.md` entry for each) and **findings**
    (`[skill]` items not fixable here). Each entry traces back to the
    empty/sparse section or low score it addresses and states the expected
    completeness gain. This is the run's feed-forward — the applied tweaks make
    the next run score higher on their own.
6.  **Process artifact** — the test process slug and a note that its typed
    document `wiki/processes/<slug>.json` (and its runtime store
    `data/runtime/<slug>.json`) is kept for inspection; counts of elements
    created per area.
7.  **Errors and findings** — a consolidated list of every console error,
    network failure, app exception or unexpected behaviour observed, with the
    stage it occurred in.

After writing it, tell the user the report URL with the real LAN IP
substituted: `http://<ip>:<port>/test-report.html`.

## Close-out

Report to the user, briefly: overall verdict, health score, the report URL,
the test process slug, the count of errors found, the Process SME assessment's
overall verdict and average area score, and the walkthrough tuning outcome —
how many `[walkthrough]` tweaks were auto-applied to this skill and how many
`[skill]` findings were recorded. Tell the user this skill edited itself, point
them to `REVISIONS.md` for the applied edits (and how to revert), and to
`walkthrough-tweaks.md` for the full list. If the run was resumed or stopped
early, say which stages still need to run and how to resume
(`/dogfood-run <run-id>`).
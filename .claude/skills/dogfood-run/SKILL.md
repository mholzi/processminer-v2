---
name: dogfood-run
description: >-
  Technical behavior test harness for Processminer skills. Creates a fresh
  process and drives it through the skill roster via the running app's UI,
  exercising every interaction path (Y / N / Deep Dive / Move On), asserting
  that skill responses reflect correctly in the UI and runtime state, and
  benchmarking execution speed per turn. Run ONLY when the user explicitly
  invokes /dogfood-run in the CLI. Never auto-route to it from the app's chat.
---

# Dogfood Run

You are an automated **skill behavior test harness** for the Processminer web
app. Your goal is to verify that each skill works correctly — not that the
documented process is high-quality. You care about three things:

1. **Interaction paths** — every skill's branching paths (Y, N/reject, Deep
   Dive, Move On) must be explicitly exercised and produce the correct app
   behavior.
2. **UI reflection** — skill responses must produce observable, correct changes
   in the UI and the backing JSON (element state, provenance, approval stamps,
   cursor advance, relevance flags).
3. **Execution speed** — wall-clock time per skill turn is recorded. Slow turns
   are findings; runaway turns are failures.

You are **not** a domain expert, you are **not** trying to produce good process
documentation, and you do **not** score content quality. The test process is a
throwaway fixture.

This skill is a **test harness**. It is invoked only by the user typing
`/dogfood-run`. Never run it against a real process and never let the app's
free chat route to it.

## Two Claude instances — keep them straight

When you run this skill you are the **outer** Claude, running in the CLI with
browser tools. The app's chat spawns its **own** `claude` worker (see
`SKILLS.md` §2) that runs the wiki skills. You never call the wiki skills
yourself — you type into the app's chat and the app's worker runs them. You
only ever drive the browser and write the report.

## Tools

Use the `preview_*` MCP tools for everything browser-related — never Bash for
browser work, never the Chrome MCP. Use Bash only for: reading the LAN IP,
git-status style checks, and reading wiki / runtime JSON files the run produced.

Available `preview_*` tools: `preview_start`, `preview_list`, `preview_stop`,
`preview_logs`, `preview_console_logs`, `preview_network`, `preview_screenshot`,
`preview_click`, `preview_fill`, `preview_inspect`, `preview_eval`.
**There is no `preview_snapshot`.** Use `preview_eval` to query DOM state —
element text, textarea placeholder, approval badges. Use `preview_screenshot`
for your own live verification; evidence in the report is textual.

**Screenshots cannot be written to disk.** Record per-stage evidence as DOM
snapshots from `preview_eval`, assertion logs, and console/network captures.

## Preconditions and setup

1.  **Dev server.** Start with `preview_start` bound to `0.0.0.0`
    (command: `npm run dev -- -H 0.0.0.0`). If one is already running on
    localhost only, stop it and restart.
2.  **LAN IP.** `ipconfig getifaddr en0` (fall back to `en1`). The report URL
    is `http://<ip>:<port>/test-report.html`.
3.  **Run id.** `YYYY-MM-DD-HHMM`. Keys everything in this run.
4.  **Run folder.** Create `public/test-report-assets/<run-id>/` — holds
    `state.json` and any DOM snapshot text files.

## Resumability

A full run takes time. Make it resumable.

- After each stage, write `public/test-report-assets/<run-id>/state.json`:
  run id, test process slug, completed stage numbers, per-stage results
  (pass/fail, assertions, notes, timings).
- On invocation with a run id argument (`/dogfood-run 2026-06-07-1234`), load
  that `state.json` and skip completed stages.
- With no argument, start fresh. **Never delete a previous run's process.**

## Timing

Record wall-clock time for every skill turn:

- Start the timer just before `preview_fill` + submit.
- Stop it when the textarea placeholder returns to `Message the assistant…`.
- Log the elapsed seconds in the stage notes.

**Speed thresholds:**
- ≤ 60 s — fast (PASS)
- 61–180 s — acceptable (PASS, note it)
- 181–300 s — slow (PASS with WARNING)
- > 300 s — runaway (FAIL; stop waiting after 600 s and mark the turn TIMEOUT)

Record the per-turn timing in `state.json` and in the report's per-stage
detail.

## Reading a chat turn

The chat textarea placeholder is `Working…` while a turn runs and
`Message the assistant…` when idle. To run one turn:

1.  `preview_fill` the textarea.
2.  Submit — `preview_click` the send control (find its selector with
    `preview_eval`).
3.  Poll `preview_eval` until placeholder is `Message the assistant…`.
    Stop polling after 600 s; if not done, mark the turn TIMEOUT.
4.  Read the assistant's reply via `preview_eval` of the chat message list.
5.  Run `preview_console_logs` and `preview_network`; record errors as findings.

## Interaction matrix

Every skill that presents a choice must exercise **all applicable paths** across
the run. The matrix below defines which paths exist and how to trigger them:

| Path | What to type | Expected behavior |
|---|---|---|
| **Y — accept** | `[Y]` or equivalent approval | Element stays / advances; provenance updates |
| **N — reject** | `[N]` or `[R]` + reason | Skill redrafts; element stays `in-progress` until accepted |
| **Deep Dive** | Click the Deep Dive button on an element | Skill opens with right specialist; element gains focused elaboration |
| **Move On** | `Move on` or skip text | Skill advances without elaborating; element stays as-is |
| **Edit** | `[E]` + specific correction | Skill incorporates the edit; heading provenance resets to `proposed` |
| **Disregard** | Triage as `disregarded` | Element gains `relevance: disregarded`; does not revert to `approved` |

For each stage, the **Paths to exercise** list tells you exactly which matrix
rows to hit. Every path exercised in a stage must be explicitly asserted.

## UI assertions — what to check after each interaction

After every interaction, read the following from the DOM and the backing JSON:

- **Element approval badge** — did it change (e.g. `in-progress` → `approved`,
  or `approved` → `in-progress` after an edit)?
- **Provenance** — for any edited heading, does
  `wiki/processes/<slug>.json` show `provenance.source === "proposed"` for
  that heading?
- **Foundational run cursor** — does `data/runtime/<slug>.json`
  `reviewState.cursor` advance after [Y]? Does it hold after [N]?
- **Relevance flag** — after a triage action, does the element show the correct
  `relevance` field?
- **Redraft** — after [N], does the next turn contain a revised draft that
  differs from the first?
- **Deep Dive specialist** — does the chat header or system message identify
  the correct specialist for the element type?

Fail the assertion if the expected state is not present. Record the raw DOM
text or JSON field value as evidence.

---

## The run — stages

Each stage is a checkpoint. Complete it, assert every item, capture DOM
snapshots as text, write `state.json`, move on. A stage with any FAIL
assertion is itself FAIL, but the run always continues to the next stage.

---

### Stage 0 — Preflight

Open the app. Assert:

- App loads without JS errors (console clean)
- Process switcher is visible
- No unexpected auth redirect

Take a screenshot for your own confirmation. Record console state.

---

### Stage 1 — new-process skill

Open the process switcher's "new process" action.

**Paths to exercise:** Y, Edit

1. When the skill presents a draft process name / slug / abbreviation, first
   send `[E]` with a minor correction to the description (e.g. change one word).
   Assert: skill incorporates the edit in a redraft.
2. Then send `[Y]` to confirm.
   Assert: new process appears in the switcher; `wiki/processes/<slug>.json`
   exists with `meta` + `content` at root; no elements yet.

Record the slug into `state.json`.

**Speed:** time from submit to the first draft appearing, and from `[Y]` to
process appearing in switcher.

---

### Stage 2 — document-ingest skill

Open the "⬆ Upload document" modal. Paste mode. File name:
`funds-release-dogfood-v1.md`. Paste the full contents of
`.claude/skills/dogfood-run/fixtures/source-doc-v1.md`.

**Paths to exercise:** Y (final confirmation after ingest)

1. Submit the upload. Wait for `document-ingest` to complete (can take
   10–25 min; do not TIMEOUT before 600 s per turn).
2. When the triage screen appears, send `[Y]` to accept the ingest summary.

Assert:

- Triage screen renders with element counts
- `wiki/processes/<slug>.json` has `ingest` field (not a sidecar `ingest.json`)
- Element arrays populated: `process-steps`, `roles`, `controls`, `systems`,
  `regulation` — at least 5 elements each
- Console clean during ingest

**Speed:** total time from upload submit to triage screen appearing.

---

### Stage 3 — foundational-run skill

From the triage screen, start the foundational run.

**Paths to exercise:** Y, N/reject, Edit, Deep Dive, Move On

Walk the first 10 elements the skill challenges. For each, apply the path
from this fixed sequence — cycle through so every path is hit at least once:

| Turn | Path | What to send |
|---|---|---|
| 1 | Y | `[Y]` |
| 2 | Y | `[Y]` |
| 3 | Edit | `[E] Change "Operations team" to "Payment Operations desk"` (or equivalent concrete correction) |
| 4 | Y | `[Y]` after edit is incorporated |
| 5 | N/reject | `[N] The description misses the 4-eyes approval step — please redraft` |
| 6 | Y | `[Y]` after redraft |
| 7 | Deep Dive | Click the Deep Dive button on element 7 |
| 8 | Y | `[Y]` after Deep Dive elaboration |
| 9 | Move On | Send `Move on` without approving |
| 10 | Y | `[Y]` |

After each path, assert:

- **Y:** cursor in `data/runtime/<slug>.json` advances; element gains approval
  stamp with approver + timestamp.
- **Edit ([E]):** heading provenance resets to `proposed` in the JSON; element
  status is `in-progress` until next [Y].
- **N/reject:** skill produces a new draft that differs from the rejected one;
  cursor does not advance until after the next [Y]; element stays `in-progress`.
- **Deep Dive:** the chat header / system message identifies the correct
  specialist; elaborated content appears in the element JSON after the turn.
- **Move On:** cursor advances past the element; element remains
  `in-progress` (not approved).

After the 10-element sequence, send `Move on` to all remaining elements to
close the foundational run. Assert: cursor reaches the end state; no
`in-progress` elements are stuck with an `approved` stamp.

**Speed:** record per-turn timing for each of the 10 path-exercised turns.
Flag any turn > 180 s.

---

### Stage 4 — source-* skills (web sourcing)

For each area with a "✦ Source from the web" CTA, trigger it:

- `source-regulation` (Regulation area)
- `source-cx` (CX Benchmarks area)
- `source-innovation` (Innovation area)
- `source-target` (Target Process area)

**Paths to exercise:** Y (accept sourced batch), Disregard (triage one element
as disregarded per skill run)

For each sourcing skill:

1. Trigger the CTA. Wait for the skill to complete.
2. When the skill presents sourced elements, send `[Y]` to accept the batch.
3. In the triage panel, find one sourced element and triage it as `disregarded`.

Assert per skill:

- New elements created in the relevant typed array
- Sourced elements carry `relevance: relevant` or `relevance: disregarded`
  (not an approval state)
- `source-target` produces elements in `to-be-design`,
  `transformation-decisions`, and gap sections
- The disregarded element shows `relevance: disregarded` in the JSON

**Speed:** total time per sourcing skill from CTA click to skill-complete.
Web research skills are expected to be slow (180–300 s acceptable); flag
anything > 300 s.

---

### Stage 5 — specialist skills via Deep Dive

Pick three elements of different types (a process-step, a control, and a
sourced CX element). On each, click the **Deep Dive** button.

**Paths to exercise:** Y, Edit, Move On (one per Deep Dive)

For each Deep Dive:

1. Let the specialist elaborate.
2. Apply one path from this sequence: first Deep Dive → Y, second → Edit,
   third → Move On.

Assert:

- **Deep Dive → Y:** element gains new content; specialist is correct for the
  element type (process-step → `process-specialist`, control →
  `control-compliance-specialist`, CX → `client-journey-specialist`); element
  provenance heading shows `document` or `elicited` (not `proposed`) after
  accept.
- **Deep Dive → Edit:** specific correction incorporated; heading provenance
  resets to `proposed` for the edited heading.
- **Deep Dive → Move On:** element content unchanged from before Deep Dive;
  element stays `in-progress`.

**Speed:** per-turn timing. Deep Dive turns typically 60–180 s; flag > 180 s.

---

### Stage 6 — add-entry skill

Trigger `add-entry` via the chat (e.g. "Add a metric: STP rate is 72%").

**Paths to exercise:** Y, N/reject

1. When the skill drafts the new element, send `[N]` with a correction ("The
   STP rate is 74%, not 72% — please revise").
2. Accept the revised draft with `[Y]`.

Assert:

- New element appears in the relevant typed array in the JSON
- After [N]: redraft differs from original; element not yet in JSON
- After [Y]: element in JSON with correct value; provenance source is
  `elicited`

**Speed:** time from trigger to draft, and from [Y] to element appearing in JSON.

---

### Stage 7 — comment-review skill

On two elements, open the Discussion panel and post a comment each (a terse
observation, e.g. "Missing SLA reference"). Then on one element, click
**"✦ Review with analyst"** to run `comment-review`.

**Paths to exercise:** Y (accept analyst's resolution)

Assert:

- Comments appear in `notes` in the process JSON after posting
- `comment-review` produces a closing analyst summary in the thread
- If the review changes element content, the element reverts from `approved`
  to `in-progress`
- [Y] closes the review; element status reflects the outcome

**Speed:** time from "Review with analyst" click to analyst summary appearing.

---

### Stage 8 — run-lint skill

Click the "⊛ Run lint" button.

**Paths to exercise:** no interaction choices; this is a non-interactive skill.
Assert behavior after completion.

Assert:

- Lint report written to `data/runtime/<slug>.json` (`lint` field) — not a
  sidecar file
- Review panel shows lint findings
- Any element implicated by a finding that was `approved` reverts to
  `in-progress`, stamped `run-lint`
- At least one finding is present (the fixture process is expected to have gaps)

**Speed:** time from button click to lint report appearing in UI.

---

### Stage 9 — conflict-resolution skill (re-ingest)

Open the upload modal again. Paste mode. File name:
`funds-release-dogfood-v2.md`. Paste the full contents of
`.claude/skills/dogfood-run/fixtures/source-doc-v2.md`. This document
deliberately contradicts v1.

Let `document-ingest` run. Then trigger `conflict-resolution` from the chat or
the triage CTA.

**Paths to exercise:** accept (keep document version), keep (keep wiki version),
Edit (resolve one conflict with a manual correction)

Walk each conflict:

| Conflict | Resolution |
|---|---|
| First conflict | Accept document version |
| Second conflict | Keep wiki version |
| Any further conflict | Edit (type a specific manual resolution) |

Assert:

- Re-ingest flags conflicts in the `ingest` field of the process JSON
- `conflict-resolution` clears resolved conflicts
- Each element reflects the chosen resolution
- An element that was `approved` before the conflict reverts to `in-progress`
  after being touched by conflict-resolution

**Speed:** time from conflict-resolution trigger to all conflicts resolved.

---

### Stage 10 — Report

Assemble the QA report and write it to:
- `public/test-report.html` (latest)
- `public/test-report-<run-id>.html` (archived)

---

## The report

A self-contained pass/fail QA report — single HTML file, inline CSS, no
external assets. Match `DESIGN.md` for type, colour, spacing.

Contents, in order:

1. **Verdict header** — run id, date, overall PASS/FAIL, health score
   (percentage of assertions passed), total duration.

2. **Stage table** — every stage: name, PASS/FAIL, duration, assertion count
   passed/total, one-line note.

3. **Per-stage detail** — for each stage:
   - Every assertion with PASS/FAIL and reason
   - DOM snapshot text captured as evidence
   - Console / network errors found
   - **Per-turn timing table**: turn, path exercised, elapsed seconds, speed
     rating (fast / acceptable / slow / runaway)

4. **Interaction path coverage** — a matrix table showing every interaction
   path (Y, N, Edit, Deep Dive, Move On, Disregard) × every skill exercised,
   with EXERCISED / NOT EXERCISED. Every "NOT EXERCISED" is a finding.

5. **Speed summary** — per-skill average turn time; ranked slowest to fastest;
   slow (> 180 s) and runaway (> 300 s) turns highlighted.

6. **UI reflection findings** — a list of every case where a skill action did
   NOT produce the expected UI or JSON state change. These are behavior bugs,
   not content issues.

7. **Process artifact** — slug, element counts per typed array in the JSON.

8. **Errors and findings** — every console error, network failure, app
   exception, or unexpected behavior observed, with the stage it occurred in.

---

## Close-out

Report to the user: overall verdict, health score, report URL (with real LAN IP),
test process slug, interaction path coverage (how many paths exercised / total),
speed summary (any runaway turns?), and count of UI reflection failures.

If the run was stopped early, say which stages still need to run and how to
resume (`/dogfood-run <run-id>`).

---
name: dogfood-target
description: >-
  Technical behavior test harness for Processminer's Target / Transformation
  track. Takes a process that already has an As-Is and drives it through the
  to-be skills via the running app's UI — transformation-agent, council-review,
  area-summary — exercising every interaction path (Y / E / R, Accept / Reject /
  Reopen), asserting that responses reflect correctly in the UI and the process
  JSON, and benchmarking speed per turn. The DTP Enhancer skills (dtp-regenerate,
  dtp-compare, dtp-summary) are covered by the separate /dogfood-dtp harness. Run
  ONLY when the user explicitly invokes /dogfood-target in the CLI. Never
  auto-route to it from the app's chat.
---

# Dogfood Target

You are an automated **skill behavior test harness** for the Processminer
**Target / Transformation track** — the As-Is → To-Be development arc. You are
the sibling of `dogfood-run` (which covers As-Is authoring); this harness covers
everything downstream of a documented As-Is. You care about three things:

1. **Interaction paths** — every target skill's branching paths
   (Y / E / R on drafts, Accept / Reject / Reopen on council items) must be
   explicitly exercised and produce the correct app behavior.
2. **UI + state reflection** — skill responses must produce observable, correct
   changes in the UI **and** the backing state: target element arrays
   (`to-be-design`, `transformation-decisions`, `gap-resolution`, …) and their
   provenance/approval in `wiki/processes/<slug>.json`; and `targetReview` /
   `summaries` on the process JSON.
3. **Execution speed** — wall-clock per skill turn is recorded. Slow turns are
   findings; runaway turns are failures.

You are **not** a domain expert and you do **not** score content quality. The
target you develop is a throwaway test artifact.

This skill is a **test harness**, invoked only by the user typing
`/dogfood-target`. Never run it against a real process and never let the app's
free chat route to it.

## Two Claude instances — keep them straight

When you run this skill you are the **outer** Claude, running in the CLI with
browser tools. The app's chat spawns its **own** `claude` worker (see
`SKILLS.md` §2) that runs the wiki skills. You never call the target skills
yourself — you type into the app's chat or click its CTAs and the app's worker
runs them. You only ever drive the browser and write the report.

## The precondition that makes this track testable

The Target track develops a To-Be **from an existing As-Is**. This harness does
**not** author an As-Is — it needs one already on disk. On invocation:

- **With a slug argument** (`/dogfood-target funds-release-dogfood-v1`) — use
  that process.
- **Without an argument** — pick the most recently-modified process whose As-Is
  arrays are populated (`process-steps` ≥ 5 **and** at least one of
  `pain-points` / `process-gaps` / `compliance-gaps` present — the problems the
  target must cover). Good candidates are processes a prior `dogfood-run` built.

If no process has a usable As-Is, **stop** and tell the user to run
`/dogfood-run` first (or name a slug). A target with nothing to transform is not
a valid test.

## Tools

Use the `preview_*` MCP tools for everything browser-related — never Bash for
browser work, never the Chrome MCP. Use Bash only for: reading the LAN IP,
git-status style checks, and reading wiki / runtime JSON files the run produced.

Available `preview_*` tools: `preview_start`, `preview_list`, `preview_stop`,
`preview_logs`, `preview_console_logs`, `preview_network`, `preview_screenshot`,
`preview_click`, `preview_fill`, `preview_inspect`, `preview_eval`.
**There is no `preview_snapshot`.** Use `preview_eval` to query DOM state. Use
`preview_screenshot` for your own live verification; evidence in the report is
textual.

**Screenshots cannot be written to disk.** Record per-stage evidence as DOM
snapshots from `preview_eval`, assertion logs, and console/network captures.

## Preconditions and setup

1.  **Dev server.** Start with `preview_start` bound to `0.0.0.0`
    (command: `npm run dev -- -H 0.0.0.0`). If one is already running on
    localhost only, stop it and restart.
2.  **LAN IP.** `ipconfig getifaddr en0` (fall back to `en1`). The report URL
    is `http://<ip>:<port>/target-report.html`.
3.  **Run id.** `YYYY-MM-DD-HHMM`. Keys everything in this run.
4.  **Run folder.** Create `public/test-report-assets/target-<run-id>/` — holds
    `state.json` and any DOM snapshot text files.

## Resumability

A full run takes time. Make it resumable.

- After each stage, write `public/test-report-assets/target-<run-id>/state.json`:
  run id, target process slug, completed stage numbers, per-stage results
  (pass/fail, assertions, notes, timings).
- On invocation with a run id argument (`/dogfood-target target-2026-06-08-1234`),
  load that `state.json` and skip completed stages.
- With no run-id argument, start fresh. **Never delete a previous run's work.**

## Timing

Record wall-clock time for every skill turn:

- Start the timer just before `preview_fill` + submit (or the CTA click).
- Stop it when the textarea placeholder returns to `Message the assistant…`.
- Log the elapsed seconds in the stage notes.

**Speed thresholds:**
- ≤ 60 s — fast (PASS)
- 61–180 s — acceptable (PASS, note it)
- 181–300 s — slow (PASS with WARNING)
- > 300 s — runaway (FAIL; stop waiting after 600 s and mark the turn TIMEOUT)

## Reading a chat turn

The chat textarea placeholder is `Working…` while a turn runs and
`Message the assistant…` when idle. To run one turn:

1.  `preview_fill` the textarea (or `preview_click` the CTA).
2.  Submit — `preview_click` the send control (`button.chat-send`; while a turn
    runs it is `button.chat-stop`). Find selectors with `preview_eval`.
3.  Poll `preview_eval` until placeholder is `Message the assistant…`.
    Stop polling after 600 s; if not done, mark the turn TIMEOUT.
4.  Read the assistant's reply via `preview_eval` of the chat message list.
5.  Run `preview_console_logs` and `preview_network`; record errors as findings.

## Interaction matrix — target track

| Path | Where | What to do | Expected behavior |
|---|---|---|---|
| **Y — accept** | transformation-agent draft | `[Y]` | Element stays `status: draft`; provenance updated |
| **E — edit** | transformation-agent draft | `[E]` + correction | Edit incorporated; edited heading provenance resets to `proposed`; **not** approved |
| **R — reject** | transformation-agent draft | `[R]`/`[N]` + reason | Skill redrafts (differs); element stays `in-progress`/`draft`; not approved |
| **Accept** | council item | click `Accept` | `targetReview.items[i].triage = "accepted"` |
| **Reject** | council item | click `Reject` | `triage = "rejected"` |
| **Reopen** | council item | click `Reopen` | `triage = "pending"` |

## UI + state assertions — what to check after each interaction

After each interaction, read from the DOM and the backing state:

- **Target elements** — do new `target-state` (TS-…), `transformation-decision`
  (TD-…), `gap` (VG-…), `requirement`, `dependency`, `assumption` elements
  appear in their arrays in `wiki/processes/<slug>.json`?
- **Draft, not approved** — everything the target skills write is
  `meta.status: "draft"` / `meta.approval` unset. Nothing should be `approved`
  (the SME approves later in the app).
- **Provenance** — for any edited heading, is `meta.provenance.<heading>.source`
  `proposed` after an `[E]`?
- **Council review** — `process.targetReview` has `ran: [...]` and
  `items: [{ specialist, title, detail, targets, triage }]`; triage clicks flip
  `triage`.
- **Coverage** — `CoverageRollup` shows "{covered} / {total} open problems
  covered" and reflects the transformation-decisions' `resolves` links.
- **Summaries** — `process.summaries.<area>` (area-summary) gets the
  four-section memo.

Fail the assertion if the expected state is not present. Record the raw DOM text
or JSON field value as evidence.

---

## The run — stages

Each stage is a checkpoint. Complete it, assert every item, capture DOM
snapshots as text, write `state.json`, move on. A stage with any FAIL assertion
is itself FAIL, but the run always continues to the next stage.

---

### Stage 0 — Preflight & As-Is precondition

Open the app and select the target process (per "the precondition" above).
Assert:

- App loads without JS errors (console clean)
- The chosen process exists and is open (URL `?p=<slug>`)
- Its As-Is is usable: `wiki/processes/<slug>.json` has `process-steps` ≥ 5 and
  at least one problem array (`pain-points` / `process-gaps` / `compliance-gaps`)
  with ≥ 1 element

Record the slug into `state.json`. If the precondition fails, mark Stage 0 FAIL,
write the report, and stop (the rest of the run cannot be meaningful).

---

### Stage 1 — transformation-agent skill

`transformation-agent` is **chat-triggered** (no CTA). Trigger it:
`Let's design the target state for this process.`

**Paths to exercise:** Y, E, R.

Walk the first few elements the skill drafts, cycling the paths:

| Turn | Path | What to send |
|---|---|---|
| 1 | Y | `[Y]` |
| 2 | E | `[E]` + a concrete correction (e.g. "tighten the rationale to name the pain-point it closes") |
| 3 | Y | `[Y]` after the edit is incorporated |
| 4 | R | `[R] This decision doesn't say what it replaces — redraft with the As-Is steps it supersedes` |
| 5 | Y | `[Y]` after the redraft |

After each path, assert:

- **Y:** the element is written to its target array
  (`to-be-design` / `transformation-decisions` / `gap-resolution` / …) as
  `status: draft`; provenance present; **not** `approved`.
- **E:** the edit is incorporated in the re-presented draft; the edited heading's
  provenance is `proposed`; the element is **not** approved.
- **R:** the next turn's draft differs from the rejected one; the element stays
  `in-progress` / unapproved.

Then tell the skill `That covers enough for this test — wrap up the target
design.` Assert: at least one `target-state` (TS-…) and one
`transformation-decision` (TD-…) exist, all `status: draft`.

**Speed:** per-turn timing. Flag any turn > 180 s.

---

### Stage 2 — Coverage + TO-BE synthesis (UI reflection)

No skill — assert the UI reflects Stage 1's writes.

1. Open the **TO-BE Design** section (nav key `to-be-design`). Assert the
   `TargetSynthesis` view renders one row per As-Is process-step, with target
   themes (or "Unchanged") mapped to each.
2. Open the **Validation** section (nav key `validation`). Assert the
   `CoverageRollup` renders "{covered} / {total} open problems covered by the
   target", and that `covered` reflects the `resolves` links on the
   `transformation-decision` elements written in Stage 1 (cross-check the count
   against the JSON).

Record the coverage line as evidence. (No timing — this is a render check.)

---

### Stage 3 — council-review skill

In the **Validation** section, find the council CTA.

**Paths to exercise:** full council, then per-item Accept / Reject / Reopen.

1. Click **`✦ Run full council`** (`button.canvas-act`). Wait for completion.
   Assert: `process.targetReview.ran` lists the five perspective specialists and
   `targetReview.items[]` is non-empty.
2. In the **Council Review panel** (`TargetReviewPanel`), on three different
   items: click **Accept** on the first, **Reject** on the second, **Reopen** on
   the third (`button.act` / `button.act.ai`).
   Assert each item's `triage` in `process.targetReview` becomes
   `accepted` / `rejected` / `pending` respectively.
3. Click an element-ref chip (`button.link-chip-nav`) on one item; assert the
   app navigates to that element (`?` URL or the element card opens).

**Speed:** time the full-council run (web/LLM heavy; 180–300 s acceptable; flag
> 300 s). Triage clicks are instant UI writes — assert, don't time.

---

### Stage 4 — area-summary skill (Target area)

Open the Target **area** view (nav key `__area:target`). Click
**`✦ Generate executive summary`** (`button.section-summary-btn.primary` →
`generateAreaSummary("target")`).

**Paths to exercise:** none interactive (the four parts are editable post-hoc;
optionally exercise one **Edit → Save** on a part).

Assert:

- `process.summaries.target` is written with the four required section headings
  (`## Introduction`, `## Current state`, `## What stands out`,
  `## Recommendation`)
- The `SummaryPanel` renders the four parts, each with an `Edit` affordance
- (Optional) editing one part and saving persists the change to
  `summaries.target`

**Speed:** time from click to summary rendering.

---

### Stage 5 — Report

Assemble the QA report and write it to:
- `public/target-report.html` (latest)
- `public/target-report-<run-id>.html` (archived)

---

## The report

A self-contained pass/fail QA report — single HTML file, inline CSS, no external
assets. Match `DESIGN.md` for type, colour, spacing.

Contents, in order:

1. **Verdict header** — run id, date, target process slug, overall PASS/FAIL,
   health score (% of assertions passed), total duration.
2. **Stage table** — every stage: name, PASS/FAIL, duration, assertion
   count passed/total, one-line note.
3. **Per-stage detail** — every assertion with PASS/FAIL and reason; DOM snapshot
   text as evidence; console / network errors; per-turn timing table (turn,
   path, elapsed s, speed rating).
4. **Interaction path coverage** — a matrix: every target path
   (Y / E / R, Accept / Reject / Reopen) × every skill exercised,
   EXERCISED / NOT EXERCISED. Every "NOT EXERCISED" is a finding.
5. **Speed summary** — per-skill average turn time, ranked slowest to fastest;
   slow (> 180 s) and runaway (> 300 s) highlighted.
6. **State reflection findings** — every case where a skill action did NOT
   produce the expected UI or state change (target element, provenance,
   `targetReview` triage, summary). Behavior bugs, not content issues.
7. **Target artifact** — slug, counts per target array (`to-be-design`,
   `transformation-decisions`, `gap-resolution`, …), `targetReview` item count +
   triage breakdown, which `summaries` exist.
8. **Errors and findings** — every console error, network failure, app
   exception, or unexpected behavior, with the stage it occurred in.

---

## Close-out

Report to the user: overall verdict, health score, report URL (with real LAN
IP), target process slug, interaction-path coverage (how many paths exercised /
total), speed summary (any runaway turns?), and count of state-reflection
failures.

If the run was stopped early, say which stages still need to run and how to
resume (`/dogfood-target target-<run-id>`).

---
name: dogfood-dtp
description: >-
  Technical behavior test harness for Processminer's DTP Enhancer — the
  procedure-document (DTP) compare / regenerate / summary flow. Takes a process
  that already has a worked As-Is and an original ingested DTP, and drives it
  through dtp-regenerate, dtp-compare and dtp-summary via the running app's UI,
  exercising the finding-disposition paths (Open / Fix in DTP / Reconcile wiki),
  asserting that responses reflect correctly in the DTP Enhancer UI and the
  runtime store (`dtpReports`), and benchmarking speed per turn. Run ONLY when
  the user explicitly invokes /dogfood-dtp in the CLI. Never auto-route to it
  from the app's chat.
---

# Dogfood DTP

You are an automated **skill behavior test harness** for the Processminer
**DTP Enhancer** — the procedure-document sub-track. You are a sibling of
`dogfood-run` (As-Is authoring) and `dogfood-target` (To-Be development); this
harness covers the DTP compare / regenerate / summary flow, which works against
the **original ingested procedure document** rather than the To-Be elements.
You care about three things:

1. **Interaction paths** — the DTP finding dispositions
   (Open → Fix in DTP / Reconcile wiki…) must be explicitly exercised and
   produce the correct app behavior.
2. **UI + state reflection** — skill responses must produce observable, correct
   changes in the DTP Enhancer UI **and** the backing state: the runtime
   `dtpReports[]` array (`mode`, `findings[]`, `generatedFile`, per-finding
   `disposition`, `summary`) in `data/runtime/<slug>.json`, and the regenerated
   `.md` artifact under `raw-sources/<slug>/`.
3. **Execution speed** — wall-clock per skill turn is recorded. Slow turns are
   findings; runaway turns are failures.

You are **not** a domain expert and you do **not** score content quality. The
DTP artifacts you produce are throwaway test outputs.

This skill is a **test harness**, invoked only by the user typing
`/dogfood-dtp`. Never run it against a real process and never let the app's free
chat route to it.

## Two Claude instances — keep them straight

When you run this skill you are the **outer** Claude, running in the CLI with
browser tools. The app's chat spawns its **own** `claude` worker (see
`SKILLS.md` §2) that runs the wiki skills. You never call the DTP skills
yourself — you click the DTP Enhancer's CTAs (or type into chat) and the app's
worker runs them. You only ever drive the browser and write the report.

## The precondition that makes this track testable

The DTP Enhancer compares/regenerates **against an original DTP document**. This
harness does **not** author an As-Is or upload a DTP — it needs both already on
disk. On invocation:

- **With a slug argument** (`/dogfood-dtp funds-release-dogfood-v1`) — use that
  process.
- **Without an argument** — pick the most recently-modified process that has
  **both** a worked As-Is (`process-steps` ≥ 5) **and** a source DTP on disk
  (an `ingest.file` recorded, with the file present under `raw-sources/<slug>/`).
  A process a prior `dogfood-run` built satisfies both (the ingested
  `source-doc-v1.md` lives in `raw-sources/<slug>/`).

If no process has both, **stop** and tell the user to run `/dogfood-run` first
(or name a slug). With no original DTP there is nothing to compare against.

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
    is `http://<ip>:<port>/dtp-report.html`.
3.  **Run id.** `YYYY-MM-DD-HHMM`. Keys everything in this run.
4.  **Run folder.** Create `public/test-report-assets/dtp-<run-id>/` — holds
    `state.json` and any DOM snapshot text files.

## Resumability

A full run takes time. Make it resumable.

- After each stage, write `public/test-report-assets/dtp-<run-id>/state.json`:
  run id, process slug, completed stage numbers, per-stage results (pass/fail,
  assertions, notes, timings).
- On invocation with a run id argument (`/dogfood-dtp dtp-2026-06-08-1234`), load
  that `state.json` and skip completed stages.
- With no run-id argument, start fresh. **Never delete a previous run's work.**

## Timing

Record wall-clock time for every skill turn:

- Start the timer just before the CTA click (or `preview_fill` + submit).
- Stop it when the textarea placeholder returns to `Message the assistant…`.
- Log the elapsed seconds in the stage notes.

**Speed thresholds:**
- ≤ 60 s — fast (PASS)
- 61–180 s — acceptable (PASS, note it)
- 181–300 s — slow (PASS with WARNING)
- > 300 s — runaway (FAIL; stop waiting after 600 s and mark the turn TIMEOUT)

DTP compare/regenerate read the whole As-Is and rewrite a procedure — they are
LLM-heavy. 180–300 s is acceptable; flag > 300 s.

## Reading a chat turn

The chat textarea placeholder is `Working…` while a turn runs and
`Message the assistant…` when idle. To run one turn:

1.  `preview_click` the CTA (or `preview_fill` + submit `button.chat-send`;
    while a turn runs it is `button.chat-stop`).
2.  Poll `preview_eval` until placeholder is `Message the assistant…`.
    Stop polling after 600 s; if not done, mark the turn TIMEOUT.
3.  Read the assistant's reply via `preview_eval` of the chat message list.
4.  Run `preview_console_logs` and `preview_network`; record errors as findings.

## The DTP Enhancer UI (nav key `__dtp` → `DTPReviewPanel`)

- **Home** — three cards + a past-comparison history table:
  - "Select a source DTP" → `Choose document` (`button.dtpx-btn.primary`) opens
    a picker; each source file is a row (`button.dtpx-picker-row`). Picking one
    fires **dtp-compare**.
  - "Upload an old DTP" → `Upload file` (`button.dtpx-btn`).
  - "Past comparisons" → `Open latest` (`button.dtpx-btn`); history rows
    (`tr.dtpx-tr`) open a run (`onOpenRun(runId)`).
- **Run view** — diff (regenerate mode) + critical-review findings. Each finding
  has a disposition dropdown (Open / Fix in DTP / Reconcile wiki…), which calls
  `PATCH /api/dtp-disposition` `{ slug, runId, findingId, disposition }`
  (`open` | `accepted` | `dismissed`). "Reconcile wiki…" opens the chat. A
  `Generate executive summary` control drives **dtp-summary**.

## Interaction matrix — DTP track

| Path | Where | What to do | Expected behavior |
|---|---|---|---|
| **Open** | DTP finding | dropdown → Open | `dtpReports[r].findings[i].disposition = "open"` |
| **Fix in DTP** | DTP finding | dropdown → Fix in DTP | `disposition = "accepted"` |
| **Reconcile wiki…** | DTP finding | dropdown → Reconcile wiki… | `disposition = "dismissed"`; opens chat to reconcile the As-Is |

## State assertions — what to check after each interaction

- **DTP report** — runtime `dtpReports[]` gains an entry with the right `mode`
  (`regenerate` | `compare`), a non-empty `findings[]` (each
  `{ id: "DTPF-…", kind, severity, headline, dtpSays, wikiSays, elements }`),
  and, for regenerate, a `generatedFile`.
- **Regenerated artifact** — for regenerate, a new Markdown file exists under
  `raw-sources/<slug>/`, flagged `generated` in the uploads manifest.
- **Disposition** — a disposition change flips
  `dtpReports[r].findings[i].disposition` in the runtime store (confirm via
  `preview_network` on `PATCH /api/dtp-disposition` and the JSON).
- **Summary** — `dtpReports[r].summary` is written with a four-section memo.

Fail the assertion if the expected state is not present. Record the raw DOM text
or JSON field value as evidence.

---

## The run — stages

Each stage is a checkpoint. Complete it, assert every item, capture DOM
snapshots as text, write `state.json`, move on. A stage with any FAIL assertion
is itself FAIL, but the run always continues to the next stage.

---

### Stage 0 — Preflight & DTP precondition

Open the app and select the process (per "the precondition" above). Assert:

- App loads without JS errors (console clean)
- The chosen process exists and is open (URL `?p=<slug>`)
- It has a worked As-Is (`process-steps` ≥ 5 in `wiki/processes/<slug>.json`)
- It has an original DTP: `ingest.file` is recorded and the file is present
  under `raw-sources/<slug>/`

Record the slug into `state.json`. If the precondition fails, mark Stage 0 FAIL,
write the report, and stop.

---

### Stage 1 — dtp-regenerate skill

Open the **DTP Enhancer** (nav key `__dtp`). Trigger `dtp-regenerate` — if a
regenerate CTA is present use it; otherwise trigger via chat:
`Run dtp-regenerate for this process from its original DTP.` (Keep this distinct
from the picker's `Choose document` → file row, which drives dtp-compare in
Stage 2.)

**Paths to exercise:** none interactive; assert the produced artifacts.

Assert:

- A runtime `dtpReports[]` entry with `mode: "regenerate"`, a `generatedFile`
  (a new Markdown under `raw-sources/<slug>/`, flagged `generated`), and a
  non-empty `findings[]`
- The DTP run view renders the diff and the findings list
- Console clean during the run

**Speed:** total time from trigger to run view. LLM-heavy; flag > 300 s.

---

### Stage 2 — dtp-compare skill + finding disposition

In the **DTP Enhancer** home, card **"Select a source DTP"** → `Choose document`
(`button.dtpx-btn.primary`) → pick a source file row (`button.dtpx-picker-row`).
This fires `dtp-compare`.

**Paths to exercise:** the finding dispositions — Open, Fix in DTP, Reconcile.

1. Wait for completion. Assert a runtime `dtpReports[]` entry with
   `mode: "compare"`, a `sourceFile`, no `generatedFile`, and a non-empty
   `findings[]`.
2. In the run view, exercise the disposition dropdown on three different
   findings:
   - One → **Fix in DTP** (assert `disposition = "accepted"`)
   - One → **Reconcile wiki…** (assert `disposition = "dismissed"`; assert the
     chat opens to reconcile the As-Is)
   - One → back to **Open** (assert `disposition = "open"`)
   After each, confirm the change via `preview_network` on
   `PATCH /api/dtp-disposition` **and** the runtime JSON.

**Speed:** total compare time (LLM-heavy; flag > 300 s). Disposition clicks are
instant API writes — assert, don't time.

---

### Stage 3 — dtp-summary skill

From the compare run view (Stage 2), click **`Generate executive summary`**
(drives `dtp-summary`, handing the findings inline).

**Paths to exercise:** none interactive.

Assert:

- The runtime `dtpReports[r].summary` field is written with a Markdown memo
- The memo carries the narrative structure (Introduction / Current state / What
  stands out / Recommendation)
- The DTP summary section renders it with a `Regenerate` button

**Speed:** time from click to summary rendering.

---

### Stage 4 — Report

Assemble the QA report and write it to:
- `public/dtp-report.html` (latest)
- `public/dtp-report-<run-id>.html` (archived)

---

## The report

A self-contained pass/fail QA report — single HTML file, inline CSS, no external
assets. Match `DESIGN.md` for type, colour, spacing.

Contents, in order:

1. **Verdict header** — run id, date, process slug, overall PASS/FAIL, health
   score (% of assertions passed), total duration.
2. **Stage table** — every stage: name, PASS/FAIL, duration, assertion count
   passed/total, one-line note.
3. **Per-stage detail** — every assertion with PASS/FAIL and reason; DOM snapshot
   text as evidence; console / network errors; per-turn timing.
4. **Interaction path coverage** — a matrix: every disposition path
   (Open / Fix in DTP / Reconcile wiki) × the run, EXERCISED / NOT EXERCISED.
   Every "NOT EXERCISED" is a finding.
5. **Speed summary** — per-skill turn time; slow (> 180 s) and runaway (> 300 s)
   highlighted.
6. **State reflection findings** — every case where a skill action did NOT
   produce the expected UI or state change (`dtpReports` entry, `generatedFile`,
   disposition, summary). Behavior bugs, not content issues.
7. **DTP artifact** — slug, per-run summary: `runId`, `mode`, finding count by
   `kind`/`severity`, disposition breakdown, whether a `summary` and
   `generatedFile` exist.
8. **Errors and findings** — every console error, network failure, app
   exception, or unexpected behavior, with the stage it occurred in.

---

## Close-out

Report to the user: overall verdict, health score, report URL (with real LAN
IP), process slug, disposition-path coverage (how many of Open / Fix / Reconcile
exercised), speed summary (any runaway turns?), and count of state-reflection
failures.

If the run was stopped early, say which stages still need to run and how to
resume (`/dogfood-dtp dtp-<run-id>`).

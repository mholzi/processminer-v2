---
name: dtp-compare
description: >-
  Compare a chosen DTP (procedure document) against the corrected As-Is wiki and
  critically review it — surface every material discrepancy between the document
  and the analysis, and store the findings via the writeDtpComparison tool. This
  is review-only: no DTP is regenerated and no new artifact is written. Non-
  interactive: no SME questions, no approval loop. Invoked by the DTP Enhancer's
  "Select a source DTP" action. Use this whenever the user wants to compare,
  review or check an existing DTP against the wiki without rebuilding it.
---

# DTP Compare

You check an existing **DTP** (the bank's procedure document) against the
corrected As-Is wiki. An analyst worked the As-Is end to end, so the wiki now
holds a *better, corrected* current state than the original document. You
produce **one** thing:

- a **critical review** — the chosen DTP measured against the wiki, one finding
  per material discrepancy.

You do **not** regenerate or rewrite the DTP, and you do **not** write any new
document artifact. This is review-only.

You are **non-interactive** — you read, review and report. No SME questions, no
approval loop, like `area-summary`. You never create, edit or approve wiki
elements, and you never touch the process JSON.

You are invoked with a process `<slug>` and the DTP filename to review under
`raw-sources/<slug>/`.

## Step 1 — Read the DTP

Read the document at `raw-sources/<slug>/<file>` (Claude Code reads PDF,
Markdown, Word and text directly). If no filename was given, list
`raw-sources/<slug>/` and take the most recently ingested document (ignore any
file marked `generated` in `uploads.json`). Study its **structure** — its
sections, headings and ordering — so you can walk it methodically in Step 3.

## Step 2 — Read the corrected As-Is wiki

Read the process overview (root `meta`/`content`) in the Document Map, then read
**every As-Is element** with `expandElement({ type })` and
`expandElement({ type, id })` for the bodies. The As-Is element types are:
`process-step`, `role`, `exception`, `pain-point`, `metric`, `process-gap`,
`country-variation` — plus `control` and `system` where the DTP covered them.

- **Prefer approved content.** An element approved by the SME is the trusted
  current state. Note still-`draft` or `in-progress` elements — you may rely on
  them, but they are weaker ground for a "the analysis found…" claim.
- The wiki is the **authority** here. Where the wiki and the DTP disagree, the
  wiki wins — that disagreement is a finding.

## Step 3 — Critically review the DTP

Walk the DTP section by section against the wiki and emit one finding per
**material** discrepancy — not every cosmetic wording difference. Each finding
is `{ kind, headline, dtpSays, wikiSays, elements, severity }`:

- `kind`:
  - `outdated` — the DTP describes a state the analysis has since superseded.
  - `missing` — the wiki holds content (an exception, a control, a pain point)
    the DTP omits entirely.
  - `contradiction` — the DTP and the wiki state different facts (an owner, an
    SLA, a sequence) for the same thing.
  - `added` — the analysis introduced something genuinely new the DTP never had.
- `headline` — a single plain-English sentence naming the discrepancy, written
  so a reviewer can scan a list and grasp it without reading both sides (e.g.
  "KYC review is documented as a manual 2-day check, but is now same-day STP").
- `dtpSays` — what the document states (or `—` when it is silent).
- `wikiSays` — what the corrected wiki holds.
- `elements` — the implicated wiki element ids (e.g. `["PS-COB-003", "CP-COB-001"]`).
- `severity` — `high` (a control/risk/regulatory gap, a wrong owner on a key
  step), `medium`, or `low` (a minor omission or refinement).

Be a critic, not a stenographer: the value is in the discrepancies that matter
to someone relying on the document.

## Step 4 — Store the review

Pass the findings to the `writeDtpComparison({ slug, report })` tool, where
`report` is `{ sourceFile: "<the reviewed filename>", findings: [ … ] }`.

The tool stamps the finding ids (`DTPF-…`) and stores the comparison as a new
entry in the runtime past-comparison history — never the wiki JSON, and with no
generated artifact. It returns the run id and finding count.

Then report exactly one line, with the counts the tool returned:

> Compared **{sourceFile}** against the As-Is — {n} critical-review finding(s).

## Scope

You review one DTP per run, against the As-Is only (never the target/to-be).
You write only the comparison findings — you never regenerate the DTP, never
write a document artifact, never create, edit or approve wiki elements, never
resolve conflicts, and never modify the process JSON. Everything you state must
trace to the wiki's As-Is elements or the reviewed document.

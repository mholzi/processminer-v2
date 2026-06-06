---
name: dtp-regenerate
description: >-
  Regenerate a process's DTP (procedure document) from the corrected As-Is wiki
  and critically review the original ingested DTP against it. Read the original
  document and the worked As-Is, rewrite the procedure from the wiki's current
  truth, surface every material discrepancy between the old document and the
  analysis, and store both via the writeDtpReport tool — a new versioned .md
  artifact plus the critical-review findings. Non-interactive: no SME questions,
  no approval loop. Invoked by a button. Use this whenever the user wants to
  regenerate, rebuild or re-issue the DTP from the As-Is, or critically review
  the original DTP against the wiki.
---

# DTP Regenerate

You close the loop on the As-Is. A process started from an uploaded **DTP**
(the bank's procedure document); an analyst then worked the As-Is end to end,
so the wiki now holds a *better, corrected* current state than the original
document. You produce two things from that:

1. a **regenerated DTP** — the procedure document rewritten from the corrected
   As-Is wiki, and
2. a **critical review** — the original DTP measured against the wiki, one
   finding per material discrepancy.

You are **non-interactive** — you read, write and report. No SME questions, no
approval loop. This is a silent generation, like `area-summary`. You never
create, edit or approve wiki elements, and you never touch the process JSON.

You are invoked with a process `<slug>` and (usually) the original DTP filename
under `raw-sources/<slug>/`.

## Step 1 — Read the original DTP

Read the original document at `raw-sources/<slug>/<file>` (Claude Code reads
PDF, Markdown, Word and text directly). If no filename was given, list
`raw-sources/<slug>/` and take the most recently ingested document (ignore any
file marked `generated` in `uploads.json` — those are your own prior outputs).
Study its **structure** — its sections, headings and ordering. The regenerated
document follows the same shape, so the bank recognises it.

## Step 2 — Read the corrected As-Is wiki

Read the process overview (root `meta`/`content`) in the Document Map, then read
**every As-Is element** with `expandElement({ type })` and
`expandElement({ type, id })` for the bodies. The As-Is element types are:
`process-step`, `role`, `exception`, `pain-point`, `metric`, `process-gap`,
`country-variation` — plus `control` and `system` where the original DTP
covered them.

- **Prefer approved content.** An element approved by the SME is the trusted
  current state. Note still-`draft` or `in-progress` elements — you may include
  them, but they are weaker ground for a "the analysis found…" claim.
- The wiki is the **authority** here, exactly as the source document was the
  authority during ingest. Where the wiki and the original DTP disagree, the
  wiki wins — that disagreement is a finding (Step 4).

## Step 3 — Regenerate the DTP

Write the new procedure document as **Markdown**, following the original's
section structure, but with every section rewritten from the wiki's current
truth:

- Walk the process by `process-step` sequence; under each step describe what
  happens, its inputs/outputs, owner, SLA, the systems it runs on and the
  controls that apply — all from the wiki elements, named by their titles.
- Fold in the corrections and additions the analysis produced: exceptions the
  original DTP omitted, pain points and process gaps it never named, controls
  it missed. This is the "(with the changes)" the regeneration is for.
- Write clean, professional procedure prose — this is a deliverable the bank
  can adopt. Do **not** invent anything the wiki does not hold; if the wiki is
  silent on something the original DTP covered, leave that section thin and let
  Step 4 record the gap as a `missing`/`outdated` finding.

## Step 4 — Critically review the original DTP

Walk the original DTP section by section against the wiki and emit one finding
per **material** discrepancy — not every cosmetic wording difference. Each
finding is `{ kind, headline, dtpSays, wikiSays, elements, severity, rationale,
suggestedDisposition }`:

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
- `dtpSays` — what the original document states (or `—` when it is silent).
- `wikiSays` — what the corrected wiki holds.
- `elements` — the implicated wiki element ids (e.g. `["PS-COB-003", "CP-COB-001"]`).
- `severity` — `high` (a control/risk/regulatory gap, a wrong owner on a key
  step), `medium`, or `low` (a minor omission or refinement).
- `rationale` — one short phrase on *why* this severity / why it matters, e.g.
  "control gap", "wrong owner on a key step", "minor wording".
- `suggestedDisposition` — your recommended call: `accepted` when the DTP is the
  thing that's wrong (a correction to make in the procedure doc), or `dismissed`
  when the discrepancy more likely means the *wiki* is wrong or incomplete.

Be a critic, not a stenographer: the value is in the discrepancies that matter
to someone relying on the old document.

## Step 5 — Store both

Pass the regenerated Markdown and the findings to the
`writeDtpReport({ slug, report })` tool, where `report` is
`{ basis: "as-is", sourceFile: "<original filename>", markdown: "<the full
regenerated DTP>", findings: [ … ], coverage: { dtpSections: [ … ] } }`.
`coverage.dtpSections` is the list of the original DTP's section/heading titles
you walked — it drives the coverage map, so name every section you reviewed even
where it raised no finding.

The tool writes the Markdown as a new versioned file under
`raw-sources/<slug>/` (flagged `generated`), stamps the finding ids (`DTPF-…`),
and stores the report (the generated filename + findings) in the runtime store —
never the wiki JSON. It returns the generated filename and finding count.

Then report exactly one line, with the counts the tool returned:

> DTP regenerated as **{generatedFile}** — {n} critical-review finding(s) against the original.

## Scope

You regenerate one DTP per run, from the As-Is only (never the target/to-be).
You write only the regenerated document and its review — you never create, edit
or approve wiki elements, never resolve conflicts, and never modify the process
JSON. Everything you state must trace to the wiki's As-Is elements or the
original document.

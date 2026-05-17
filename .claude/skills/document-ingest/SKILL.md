---
name: document-ingest
description: >-
  Review an uploaded document and extract its content into the process wiki.
  Read the document, summarise it, ask the user to confirm, then record it as a
  source and extract its content into wiki elements — creating new ones,
  updating existing ones, verifying every draft against the source document,
  and flagging conflicts. Use this whenever a document has been uploaded to
  raw-sources/ for ingestion, or the user asks to ingest, extract or process
  an uploaded document into the wiki.
---

# Document Ingest

You review a document a user uploaded for a banking process and extract its
content into the process wiki. The document is already saved under
`raw-sources/<slug>/` (Karpathy LLM-Wiki layer 1); you are invoked with its
path.

You do the judgement — read, summarise, extract, verify, spot conflicts — and
the Python scripts in `scripts/wiki/` do the mechanical work. **Use the fixed
wording below verbatim**, so every run reads the same to the user.

No SME is in the loop during an ingest: the document is the only authority,
and an extraction can quietly claim more than the document says. So every
element is verified against its source passage *before* it is written — see
Step 3.

## Step 1 — Review and summarise

Read the document at the given path (Claude Code reads PDF, Markdown, Word and
text directly). Take the process `<slug>` from the path
`raw-sources/<slug>/<file>`, and the process title from
`wiki/processes/<slug>/index.md`.

Write a clear summary — what the document is, what it covers, what process
content it holds. Then present this **exact template**, substituting `{file}`,
`{summary}` and `{process}`:

> I've reviewed **{file}**. Here is a summary:
>
> {summary}
>
> ---
> Shall I extract this document's content into the **{process}** wiki?
>
> **[Y] Yes, extract it** · **[N] No, keep the upload only**

## Step 2 — Wait for the user

On **[N]** — stop, and reply with exactly:

> Understood — the document stays in `raw-sources/` and nothing was extracted.

On **[Y]** — continue to Step 3.

## Step 3 — Reference the document, then extract

1. **Reference it as an upload.** Run
   `python3 scripts/wiki/add_source.py <slug> <file>` — this records the
   document in the process `index.md` so the wiki references the upload.

2. **Extract — draft.** Read `schema/process-schema.json` for the element
   types, their sections and templates. Go through the document; for every
   piece of content that maps to an element type:
   - Decide the element type, and read the section's existing elements to see
     whether the wiki already covers that topic.
   - **New topic** — draft the element's blocks per its schema template.
   - **Existing element the document adds to or refines, without contradiction**
     — draft the merged content (same id).
   - **Existing element the document contradicts** — do **not** overwrite.
     Leave the wiki element as it is and record the conflict: which element,
     which block or field, what the document says versus what the wiki says.
     Draft nothing for it.

3. **Verify each draft against the source — before you write it.** No SME is
   in the loop, so the document is the only authority. For every element you
   drafted, re-read the passage it came from and challenge it claim by claim:
   - For each statement in every block, find where the document supports it. A
     claim you cannot trace to the document — an inferred SLA, an invented
     system or role name, a smoothed-over detail, a number the document does
     not give — is a hallucination. **Remove it, or rewrite the block down to
     what the document actually supports.** Never write an unsupported claim.
   - Set `confidence` honestly from what survived: `high` — every block traces
     to explicit document text; `medium` — some content is reasonable inference
     across passages; `low` — the document was thin and the element is largely
     inferred.
   - Note every element where verification removed or corrected a claim — these
     go in the Step 4 summary.

4. **Write.** First clear the run manifest —
   `python3 scripts/wiki/reset_manifest.py <slug>` — so a previous run cannot
   inflate the counts. Then for each verified element, write it with the
   scripts: new topics get an id from `python3 scripts/wiki/next_id.py <slug>
   <type>` (updates keep their id), then
   `python3 scripts/wiki/write_element.py <spec.json>` (`status: draft`,
   `source: {file}`, the verified `confidence`). Each write records itself in
   the manifest as created or updated — you do **not** track those lists
   yourself.

5. **Check conformance.** Run `python3 scripts/wiki/check_conformance.py <slug>`
   and fix any element you wrote that it flags.

6. **Write the ingest report.** Assemble a JSON object — `file` (the source
   filename), `conflicts` (each `{element, field, documentSays, wikiSays}`),
   `corrections` (each `{element, field, removed}` from Step 3's
   verification). Do **not** include `created` or `updated` — the script
   derives those from the run manifest. Save the object to a temp file, then
   run `python3 scripts/wiki/write_ingest_report.py <slug> <report.json>`. It
   writes `ingest.json` (which the app's triage screen reads) and prints the
   canonical created / updated / conflict / correction counts — use those
   printed counts in Step 4.

## Step 4 — Summarise the extraction

Report what happened with this **exact template**. The created / updated /
conflict / correction counts are the ones `write_ingest_report.py` just
printed — do not recount from memory:

> Extraction complete — from **{file}**:
>
> - **Created:** {n} new element(s)
> - **Updated:** {n} existing element(s)
> - **Verified:** every draft checked against the document; {n} corrected
> - **Conflicts:** {n} — left unchanged for you to resolve
>
> {one line per verification correction:}
> - **{element id} · {block or field}** — removed: {the unsupported claim}
>
> {one line per conflict:}
> - **{element id} · {block or field}** — the document says: {a}; the wiki says: {b}
>
> The document is recorded as a source of this process. Review the drafts and
> approve them in the app.

If verification corrected nothing, write "{n} corrected" as "0 corrected" and
omit the corrections list. If there are no conflicts, write "**Conflicts:** 0"
and omit the conflict list.

## Scope

You extract whatever element types the document covers — this skill is
cross-perspective by nature. Everything you write is `status: draft`; you never
set `approved` — the user approves in the app. You never overwrite an element
on a conflict — conflicts are reported, never resolved.

Verification here checks drafts against **the source document only** — never
against an SME. When an SME later answers an elicitation question and the
answer departs from this document, that is the SME correcting a stale source,
not an error: it is not this skill's concern and never flagged.

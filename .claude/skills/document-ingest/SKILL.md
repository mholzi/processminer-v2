---
name: document-ingest
description: >-
  Review an uploaded document and extract its content into the process wiki.
  Read the document, summarise it, ask the user to confirm, then record it as a
  source and extract its content into wiki elements — creating new ones,
  updating existing ones, and flagging conflicts. Use this whenever a document
  has been uploaded to raw-sources/ for ingestion, or the user asks to ingest,
  extract or process an uploaded document into the wiki.
---

# Document Ingest

You review a document a user uploaded for a banking process and extract its
content into the process wiki. The document is already saved under
`raw-sources/<slug>/` (Karpathy LLM-Wiki layer 1); you are invoked with its
path.

You do the judgement — read, summarise, extract, spot conflicts — and the
Python scripts in `scripts/wiki/` do the mechanical work. **Use the fixed
wording below verbatim**, so every run reads the same to the user.

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

2. **Extract.** Read `schema/process-schema.json` for the element types, their
   sections and templates. Go through the document; for every piece of content
   that maps to an element type:
   - Decide the element type, and read the section's existing elements to see
     whether the wiki already covers that topic.
   - **New topic** — draft the element's blocks per its schema template, get an
     id with `python3 scripts/wiki/next_id.py <slug> <type>`, and write it with
     `python3 scripts/wiki/write_element.py <spec.json>` (`status: draft`,
     `source: {file}`).
   - **Existing element the document adds to or refines, without contradiction**
     — update it: re-write the element (same id) with the merged content via
     `write_element.py`, keeping `source: {file}`.
   - **Existing element the document contradicts** — do **not** overwrite.
     Leave the wiki element as it is and record the conflict: which element,
     which block or field, what the document says versus what the wiki says.

3. **Verify.** Run `python3 scripts/wiki/check_conformance.py <slug>` and fix
   any element you wrote that it flags.

## Step 4 — Summarise the extraction

Report what happened with this **exact template**, substituting the counts and
the conflict list:

> Extraction complete — from **{file}**:
>
> - **Created:** {n} new element(s)
> - **Updated:** {n} existing element(s)
> - **Conflicts:** {n} — left unchanged for you to resolve
>
> {one line per conflict:}
> - **{element id} · {block or field}** — the document says: {a}; the wiki says: {b}
>
> The document is recorded as a source of this process. Review the drafts and
> approve them in the app.

If there are no conflicts, write "**Conflicts:** 0" and omit the conflict list.

## Scope

You extract whatever element types the document covers — this skill is
cross-perspective by nature. Everything you write is `status: draft`; you never
set `approved` — the user approves in the app. You never overwrite an element
on a conflict — conflicts are reported, never resolved.

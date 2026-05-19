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
content it holds. Then present the canonical prompt: run `python3
scripts/wiki/verbatim.py ingest-summary` and present what it prints, filling
the `{file}` / `{summary}` / `{process}` placeholders. Reproduce every other
character — the `---` rule and the `[Y]` / `[N]` line — exactly; `verbatim.py`
is the single source of truth, never write it from memory.

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

   Map each frontmatter field to what the document actually states — never
   force content into a field just because the schema marks it `required`.
   Two field-mapping rules that recur:

   - **Metric `target` vs `value`.** A figure the document gives as a
     service-level / SLA *target* (e.g. "within 2 hours", "same business
     day") belongs in `target`. `value` is the metric's *measured actual* —
     a process-design or as-is document rarely supplies one. When the
     document gives no measured actual, set `value` to `Not measured` and
     leave `trend` empty; do **not** put the target figure in `value`.

   - **`owner` granularity — keep it consistent.** A step's `owner` is who
     *performs* it; if the step is automated and no person acts, write the
     system or `Unassigned`, not a team. A control's `owner` is the
     accountable *function* (e.g. "Payment Operations", "Compliance") —
     never a named individual or a job title, and never an operator just
     because the control is automated. Pick the same grain for every
     element of a type; do not mix function, role and individual.

3. **Verify each draft against the source — in parallel, before you write.**
   No SME is in the loop, so the document is the only authority, and an
   extraction can quietly claim more than the document says. Verifying one
   draft is independent of every other, so fan it out: split your drafts into
   a few even groups (aim for ~5–10 drafts each) and **dispatch one sub-agent
   per group with the Task tool**, in a single message; wait for all of them.
   Give each this brief:

   > You verify drafted wiki elements against their source document, for an
   > ingest of process `<slug>`. The source document is at `<path>`. Verify
   > exactly these draft specs: `<the group's specs as JSON>`. For each, find
   > the passage it came from and challenge it claim by claim:
   > - For every statement in every block, find where the document supports
   >   it. A claim you cannot trace — an inferred SLA, an invented system or
   >   role name, a smoothed-over detail, a number the document does not give
   >   — is a hallucination: remove it, or rewrite the block down to what the
   >   document actually supports. Never keep an unsupported claim.
   > - Set `confidence` from what survived: `high` — every block traces to
   >   explicit document text; `medium` — some content is reasonable
   >   inference across passages; `low` — the document was thin and the
   >   element is largely inferred.
   > - Set each block's `provenance`: a heading whose every claim traces to
   >   explicit document text → `{ "source": "document", "evidence": "<the
   >   verbatim supporting quote>" }`; a heading that survived only as
   >   inference across passages → `{ "source": "proposed", "evidence": "" }`.
   > You are **read-only** — do not write or run any script. Return a JSON
   > object `{ "elements": [<verified specs>], "corrections": [{ "element",
   > "field", "removed" }, …] }`: the verified specs with unsupported claims
   > stripped and `confidence` / `provenance` set, and one `corrections`
   > entry per claim you removed or rewrote.

   Collect every group's result. The merged `elements` are what Step 3.4
   writes; the merged `corrections` feed the Step 4 summary and the ingest
   report. (A `document` heading is approvable as it stands; a `proposed`
   heading is not — it flags exactly what still needs a human eye.)

4. **Write — one batch.** First clear the run manifest —
   `python3 scripts/wiki/reset_manifest.py <slug>` — so a previous run cannot
   inflate the counts. Then assemble **one manifest** of every verified
   element and write them all in a single call — not a script run per element.

   Build `/tmp/<slug>-elements.json`:

   ```
   { "slug": "<slug>", "source": "{file}", "elements": [ … ] }
   ```

   Each entry in `elements` is a `write_element.py` spec — `type`, `title`,
   `status: draft`, the verified `confidence`, `fields`, `relations`, and the
   `provenance` map from Step 3. The manifest's `source` applies to every
   element, so omit `source` per entry. Two batch conventions:
   - **A new topic omits `id`** — the batch writer assigns it. **An element
     the document refines keeps its `id`** — that is the update path.
   - To link two elements you are creating in the same run, give the target a
     `"tempKey"` and reference it as `"@<tempKey>"` in the other's
     `relations` — e.g. a role's `"raci": ["@step-3:R"]`, a process-step's
     `"transitions": ["@step-4|normal|done"]`. The writer resolves every
     `@<tempKey>` to the real id.

   Then run `python3 scripts/wiki/write_elements.py /tmp/<slug>-elements.json`.
   It assigns ids, resolves the references, writes every element, and records
   each in the run manifest as created or updated — you do **not** track those
   lists yourself.

5. **Fill the process overview.** The overview is the process `index.md` — its
   one-line `description`, plus the body fields: purpose, owner, trigger,
   frequency, in/out scope, input and output. The body fields are scaffolded
   blank, so a document that describes the process at a glance should fill
   them. Read `index.md`, then draft each from what the document explicitly
   states — its purpose/scope/trigger sections, its RACI or document-control
   table for the owner, its systems or data section for input and output.
   Apply the same rules as element extraction:
   - **A field the document does not state** — leave it blank. Never force a
     field, and never infer `frequency` from a volume the document does not
     give.
   - **A field already filled that the document refines without contradiction**
     — draft the merged value.
   - **A body field already filled that the document contradicts** — do **not**
     overwrite. Leave it and record the conflict, exactly as for an element
     (use `index` as the element, the field name as the field).

   The `description` is the **one exception** to the no-overwrite rule. It is a
   provisional one-liner set when the process was scaffolded — not SME-approved
   content — and a stale one mislabels the process everywhere it is shown. So
   if the document contradicts it — e.g. the description claims a scope the
   document marks out of scope — **correct it**: rewrite it as a one-line
   summary that matches the document, and note the change for the Step 4
   summary. If the document is consistent with the scaffolded description,
   leave it untouched.

   Verify the drafted overview against the source the same way as Step 3.3 —
   strip any claim you cannot trace — then write it with
   `python3 scripts/wiki/write_overview.py /tmp/<slug>-overview.json` (`docStatus`
   `As-Is draft`, `source: {file}`, the verified `confidence`; `slug`, the
   `purpose` body, and — **only when you corrected it** — `description` in the
   spec; omit `description` to keep the scaffolded one). The overview is the
   process page, not an element: it takes no id, is not in the run manifest,
   and is not counted in created / updated.

6. **Check conformance and evidence.** Run `python3
   scripts/wiki/check_conformance.py <slug>` and fix any element you wrote that
   it flags. Then run `python3 scripts/wiki/check_evidence.py <slug>` — it
   verifies every `document` heading's `evidence` is genuinely traceable to a
   file under `raw-sources/<slug>/`. If it flags an element, the quote is
   wrong, paraphrased or carried over from another document — re-read the
   source passage, correct the `evidence` to a verbatim quote from it, and
   rewrite the element. A `document` claim whose evidence cannot be traced is
   exactly the hallucination this step exists to catch; never leave it flagged.

7. **Write the ingest report.** Assemble a JSON object — `file` (the source
   filename), `conflicts` (each `{element, field, documentSays, wikiSays}` —
   an overview conflict uses `index` as the element), `corrections` (each
   `{element, field, removed}` from the Step 3 and Step 5 verification). Do
   **not** include `created` or `updated` — the script derives those from the
   run manifest. Save the object to `/tmp/<slug>-ingest-report.json`, then run
   `python3 scripts/wiki/write_ingest_report.py <slug> /tmp/<slug>-ingest-report.json`. It
   writes `ingest.json` (which the app's triage screen reads) and prints the
   canonical created / updated / conflict / correction counts — use those
   printed counts in Step 4.

## Step 4 — Summarise the extraction

Report what happened with the canonical template: run `python3
scripts/wiki/verbatim.py ingest-report` and present what it prints. Fill the
`{n}` placeholders with the created / updated / conflict / correction counts
`write_ingest_report.py` just printed — do not recount from memory — and the
`{one line per …}` blocks with one bullet per correction / conflict.
Reproduce every other character exactly; `verbatim.py` is the single source
of truth, never write the report from memory.

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

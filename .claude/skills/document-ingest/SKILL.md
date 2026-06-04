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
the native tools do the mechanical work. **Use the fixed wording below verbatim**, so every run reads the same to the user.

No SME is in the loop during an ingest: the document is the only authority,
and an extraction can quietly claim more than the document says. So every
element is verified against its source passage *before* it is written — see
Step 3.

## Step 1 — Review and summarise

Read the document at the given path (Claude Code reads PDF, Markdown, Word and
text directly). Take the process `<slug>` from the path
`raw-sources/<slug>/<file>`, and the process title from
the process overview (root `meta`/`content`) at the top of the Document Map.

Write a clear summary — what the document is, what it covers, what process
content it holds. Then present the canonical prompt:
"""
I've reviewed **{file}**. Here is a summary:

{summary}

---
Shall I extract this document's content into the **{process}** wiki?

**[Y] Yes, extract it** · **[N] No, keep the upload only**
"""
filling the `{file}` / `{summary}` / `{process}` placeholders. Reproduce every other
character — the `---` rule and the `[Y]` / `[N]` line — exactly; the verbatim text
is the single source of truth, never write it from memory.

## Step 2 — Wait for the user

On **[N]** — stop, and reply with exactly:

> Understood — the document stays in `raw-sources/` and nothing was extracted.

On **[Y]** — continue to Step 3.

## Step 3 — Reference the document, then extract

A whole document's worth of element drafts is too much linear writing for one
turn — the main agent's context will fill with manifest JSON, an auto-compact
will fire mid-flow, and you'll spend the second half of the turn re-reading
files you just wrote. So drafting fans out the same way verification already
does: the main agent plans an **outline** of every candidate element, then
dispatches one drafter sub-agent per element-type group, then one verifier per
group. The 315k-token main-agent output of the legacy flow becomes ~30k.

1.  **Identify the source document.** The file you are ingesting was already
    uploaded to `raw-sources/<slug>/` (and recorded in that folder's
    `uploads.json`) by the app's upload flow before this skill was invoked — the
    wiki's Source Documents list is derived from there, so there is **no
    register step to run**. Just confirm which uploaded file is the one to
    ingest; carry its filename as `file` through to the Step 3.8 ingest report.

2.  **Outline — plan every element up front.** Read
    `schema/process-schema.json` for the element types, their sections and
    templates. For each element type, use `expandElement({ type })` to list
    the existing element ids + titles (do **not** read their bodies yet — the
    drafter sub-agent that handles that type will read what it needs).
    Read the document end-to-end. For every piece of content that maps to an
    element type, plan one outline entry:

    -   **New topic** — emit `{ "group_id", "tempKey", "type", "title" }`. The
        `tempKey` is deterministic — `<typePrefix-lowercase>-<n>` (e.g.
        `role-1`, `sys-3`, `td-2`). `tempKey`s are unique across the whole
        outline; sister drafters reference them for cross-group relations.
    -   **Existing element the document refines, without contradiction** — emit
        `{ "group_id", "id", "type", "title" }`. Carry the existing id; this is
        the update path. Drafters use the id directly in relations (no `@`).
    -   **Existing element the document contradicts** — emit
        `{ "group_id", "conflict": true, "id", "type", "title" }`. The drafter
        will not draft this; it will emit a `conflicts` entry instead. Carry
        the existing id so the conflict points at the right element.

    Partition: **one group per element type**, splitting any type expected to
    exceed ~10 entries into `<type>-a`, `<type>-b` etc. — drafters run in
    parallel, so balance matters less than keeping each group bounded.

    Write the outline to `/tmp/<slug>-outline.json`:

    ```
    {
      "slug": "<slug>",
      "source": "<file>",
      "outline": [
        { "group_id": "role", "tempKey": "role-1", "type": "role",
          "title": "Relationship Manager" },
        { "group_id": "sys", "tempKey": "sys-3", "type": "system",
          "title": "KYC Case Manager" },
        { "group_id": "control", "id": "CP-XYZ-002", "type": "control",
          "title": "4-eyes sign-off" },
        …
      ]
    }
    ```

3.  **Draft — fan out, one sub-agent per group.** Dispatch in a single
    message; wait for all of them. Give each this brief:

    > You draft wiki elements for an ingest of process `<slug>`. The source
    > document is at `<path>`. Read `/tmp/<slug>-outline.json` — your group_id
    > is `<group_id>`; draft every outline entry whose `group_id` matches
    > yours. The full outline is yours to consult for cross-group relations.
    >
    > Read `schema/process-schema.json` for your element types' frontmatter,
    > relations and template headings. Use `expandElement({ type })` to list
    > your types' collections, then `expandElement({ type, id })` if you need an
    > existing element's body to decide how to merge a refine. Then read the document and draft
    > each assigned entry:
    >
    > -   **New entry (has `tempKey`, no `id`)** — draft a `createElement`
    >     spec: `tempKey`, `type`, `title`, `status: "draft"`, `fields`,
    >     `relations`, `provenance`, `blocks`. Use the outline's `tempKey`
    >     exactly — do not invent new ones. For cross-group relations,
    >     reference sister entries by their outline `tempKey` (e.g.
    >     `"systems": ["@sys-3"]`) or by their existing `id` if the sister is a
    >     refine. The batch writer resolves `@<tempKey>` across the whole run.
    > -   **Refine (has `id`, no `tempKey`)** — draft the same spec keyed by
    >     `id` instead of `tempKey`; produce the merged content (your draft is
    >     what will be written).
    > -   **Conflict (`conflict: true`)** — do **not** draft. Emit a
    >     `conflicts` entry: `{ "element": "<id>", "field": "<block|field>",
    >     "documentSays": "<a>", "wikiSays": "<b>" }`.
    >
    > Map each frontmatter field to what the document actually states — never
    > force content into a field just because the schema marks it `required`.
    > Two field-mapping rules that recur:
    >
    > -   **Metric `target` vs `value`.** A figure the document gives as a
    >     service-level / SLA *target* (e.g. "within 2 hours", "same business
    >     day") belongs in `target`. `value` is the metric's *measured actual* —
    >     a process-design or as-is document rarely supplies one. When the
    >     document gives no measured actual, set `value` to `Not measured` and
    >     leave `trend` empty; do **not** put the target figure in `value`.
    > -   **`owner` granularity — keep it consistent.** A step's `owner` is who
    >     *performs* it; if the step is automated and no person acts, write the
    >     system or `Unassigned`, not a team. A control's `owner` is the
    >     accountable *function* (e.g. "Payment Operations", "Compliance") —
    >     never a named individual or a job title, and never an operator just
    >     because the control is automated. Pick the same grain for every
    >     element of a type; do not mix function, role and individual.
    >
    > For each block's `provenance`, **omit the `evidence` quote** — the
    > verifier in Step 3.4 will fill it. Tag each heading provisionally:
    > `{ "source": "document" }` for a claim you can already point to in the
    > document, `{ "source": "proposed" }` for an inference across passages.
    >
    > Write your result to `/tmp/<slug>-drafts-<group_id>.json`:
    >
    > ```
    > { "group_id": "<group_id>",
    >   "source": "<file>",
    >   "elements": [ … draft specs … ],
    >   "conflicts": [ … conflict entries … ] }
    > ```
    >
    > You are **read-only on the wiki** — do not run any writer script; the
    > merge step in the parent skill writes everything. Return the result-file
    > path and a one-line count: `<n> drafted, <n> conflicts`.

4.  **Verify — fan out, one sub-agent per drafter group**, 1:1 with Step 3.3.
    Dispatch in a single message; wait for all. Give each this brief:

    > You verify drafted wiki elements against their source document, for an
    > ingest of process `<slug>`. The source document is at `<path>`. Read
    > `/tmp/<slug>-drafts-<group_id>.json` — verify every spec in `elements`.
    > For each, find the passage it came from and challenge it claim by claim:
    > -   For every statement in every block, find where the document supports
    >     it. A claim you cannot trace — an inferred SLA, an invented system or
    >     role name, a smoothed-over detail, a number the document does not give
    >     — is a hallucination: remove it, or rewrite the block down to what the
    >     document actually supports. Never keep an unsupported claim.
    > -   Set `confidence` from what survived: `high` — every block traces to
    >     explicit document text; `medium` — some content is reasonable
    >     inference across passages; `low` — the document was thin and the
    >     element is largely inferred.
    > -   Fill each block's `provenance.evidence`: a heading whose every claim
    >     traces to explicit document text → `{ "source": "document",
    >     "evidence": "<the verbatim supporting quote>" }`; a heading that
    >     survived only as inference across passages → demote to
    >     `{ "source": "proposed", "evidence": "" }`.
    >
    > You are **read-only on the wiki** — do not run any writer script. Write
    > your result to `/tmp/<slug>-verified-<group_id>.json`:
    >
    > ```
    > { "group_id": "<group_id>",
    >   "source": "<file>",
    >   "elements": [ … verified specs … ],
    >   "corrections": [ { "element", "field", "removed" }, … ] }
    > ```
    >
    > Return the result-file path and a one-line count: `<n> verified,
    > <n> corrected`.

    (A `document` heading is approvable as it stands; a `proposed` heading is
    not — it flags exactly what still needs a human eye.)

5.  **Merge + write — one batch.** Concatenate every group's verified specs
    into one `elements` array (each entry `{ type, element, tempKey? }`), and
    concatenate the drafter `conflicts` and verifier `corrections` into two
    lists you hold for the Step 3.8 report.

    Then write the batch:

    use the createElements({ elements }) tool

    It assigns every id, resolves every `@<tempKey>` reference across the whole
    batch (including cross-group references), writes every element, and returns
    `created` (the assigned ids, per spec) plus per-type `counts`. Read your
    created / updated counts from `created` and `counts` — you do **not** track
    those lists yourself.

6.  **Fill the process overview.** The overview is the process's root `meta`/`content` — its
    one-line `description`, plus the body fields: purpose, owner, trigger,
    frequency, in/out scope, input and output. The body fields are scaffolded
    blank, so a document that describes the process at a glance should fill
    them. Read the process overview (root `meta`/`content`) in the Document Map, then draft each from what the document explicitly
    states — its purpose/scope/trigger sections, its RACI or document-control
    table for the owner, its systems or data section for input and output.
    Apply the same rules as element extraction:
    -   **A field the document does not state** — leave it blank. Never force a
        field, and never infer `frequency` from a volume the document does not
        give.
    -   **A field already filled that the document refines without contradiction**
        — draft the merged value.
    -   **A body field already filled that the document contradicts** — do **not**
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

    Verify the drafted overview against the source the same way the Step 3.4
    verifiers do — strip any claim you cannot trace — then write it with the
    updateElement({ id, patch }) tool, where `id` is the **process overview's
    root id** (the root `meta.id` in the Document Map). Patch its `meta`
    (`docStatus: "As-Is draft"`, `source: {file}`, the verified `confidence`)
    and its `content` (the body fields — `processOwner`, `trigger`, `frequency`,
    `scopeIn`, `scopeOut`, `processInput`, `processOutput` — and, **only when you
    corrected it**, `description`; omit `description` to keep the scaffolded one).
    The overview is the process page, not an element in a collection: it is not
    counted in created / updated.

    If the overview produced any conflict or correction, hold it in memory —
    you append it to the merged lists in Step 3.8 before writing the report.

7.  **Check conformance.** use the checkConformance({ slug }) tool and fix any
    element you wrote that it flags — it validates every element against its
    template, frontmatter, field values **and provenance** (including that each
    `document` heading carries an `evidence` quote). For every `document` heading
    you wrote, re-read the source passage and confirm the `evidence` is a
    verbatim quote genuinely traceable to a file under `raw-sources/<slug>/`; if
    a quote is wrong, paraphrased or carried over from another document, correct
    it and rewrite the element. A `document` claim whose evidence cannot be
    traced is exactly the hallucination this step exists to catch; never leave it.

8.  **Write the ingest report.** Take the `conflicts` and `corrections` lists you
    held from Step 3.5, and append any overview-level entry from Step 3.6
    (an overview conflict uses `index` as the element). Assemble a JSON object —
    `file` (the source filename), `conflicts`, `corrections`. The created /
    updated counts come from the createElements result in Step 3.5 — you do not
    recount them here. Then use the writeIngestReport({ slug, report }) tool. It
    writes the `ingest` field in the process JSON (which the app's triage screen
    reads). Use the created / updated counts from Step 3.5 and the conflict /
    correction counts here in Step 4.

## Step 4 — Summarise the extraction

Report what happened with the canonical template:
"""
Extraction complete — from **{file}**:

- **Created:** {n} new element(s)
- **Updated:** {n} existing element(s)
- **Overview:** {filled | refined | left as-is — the document adds nothing}{, and: description corrected to match the document — if you corrected it}
- **Verified:** every draft checked against the document; {n} corrected
- **Conflicts:** {n} — left unchanged for you to resolve

{one line per verification correction:}
- **{element id} · {block or field}** — removed: {the unsupported claim}

{one line per conflict:}
- **{element id} · {block or field}** — the document says: {a}; the wiki says: {b}

The document is recorded as a source of this process. Review the drafts and approve them in the app.
"""
Fill the `{n}` placeholders with the created / updated / conflict / correction counts
the `writeIngestReport` tool just printed — do not recount from memory — and the
`{one line per …}` blocks with one bullet per correction / conflict.
Reproduce every other character exactly; the verbatim text is the single source
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
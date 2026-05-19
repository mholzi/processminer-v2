---
name: comment-review
description: >-
  Work through the open discussion comments on a wiki element with the SME —
  evaluate each comment's impact, incorporate the changes you agree on into the
  element, then post a closing summary into the discussion as the section's
  analyst. Use this whenever the user wants to review, act on or resolve the
  comments or notes left on an element.
---

# Comment Review

You work through the **open discussion comments** on a single wiki element with
the SME. For each comment you assess its impact, decide with the SME whether and
how to act on it, incorporate the agreed change into the element, and close the
loop with a summary note posted into the discussion thread.

You are invoked with a process `<slug>` and an element `<elementId>`, by the
"Review with analyst" button on the element's Discussion panel.

You do the judgement — read, assess, discuss, draft; the Python scripts in
`scripts/wiki/` do the mechanical writes (the element edit, the thread updates).

## The analyst you are

Comments are reviewed by **the specialist that owns the element's section**.
Read the element file's `section:` frontmatter, then `schema/process-schema.json`
— the section's `specialist` is the analyst: `process-specialist`,
`control-compliance-specialist`, `client-journey-specialist`,
`innovation-analyst`, `transformation-agent` or `it-architect`. Adopt that
specialist's lens for the whole run, and author the closing summary note as them
(e.g. *Process Specialist*). If the section declares no `specialist`, adopt a
general process-analyst lens and sign the summary *Process Analyst*.

## Step 1 — Read the element and its comments

- Read the element file at `wiki/processes/<slug>/<section>/<elementId>.md` —
  its content, `status`, `confidence` and relations.
- Read `wiki/processes/<slug>/notes.json` — the `<elementId>` entry is the
  comment thread. The comments to review are the **unresolved** ones: a note
  *without* `resolved: true`. A note with `resolved: true` is already handled —
  skip it. A note with `replyTo` set is a reply; read it under its parent.
- If there are no unresolved comments, tell the SME there is nothing to review
  and stop — write nothing.
- Run `python3 scripts/wiki/show_template.py <type>` for the element's type, so
  any edit you make keeps every block and field conformant.
- Read the elements the comments touch on — a comment may reference other steps,
  controls or systems; pull those in so your assessment is grounded.

## Step 2 — Work each comment with the SME

Take the unresolved comments one at a time, oldest first. For each, present:
- the comment — author, text, and any replies;
- your **impact assessment** — what the comment implies for this element and,
  where relevant, the wider process; whether it is a factual correction, a real
  gap, an open question, or out of scope.

Then offer the SME exactly three choices:
- **[I] Incorporate** — the comment is valid; agree with the SME on the precise
  change, then apply it in Step 3.
- **[D] Decline** — the comment does not warrant a change; capture the SME's
  one-line reason for the summary.
- **[S] Skip for now** — leave the comment open; it is not resolved this run.

Loop until every unresolved comment has a decision. Never decide for the SME.

## Step 3 — Incorporate the agreed changes

For each **[I]** comment, edit the element through the normal draft flow:
- a single block — write the new block text to a temp file, then
  `python3 scripts/wiki/patch_element.py <slug> <elementId> --block "<heading>" <file>`;
- a frontmatter field —
  `python3 scripts/wiki/patch_element.py <slug> <elementId> --field <key> <value>`;
- a relation id-list —
  `python3 scripts/wiki/patch_element.py <slug> <elementId> --list <key> <ids>`;
- a broad rewrite — assemble a full `write_element.py` spec and write it.

Any edit re-opens the element's approval — the scripts handle that. Then run
`python3 scripts/wiki/check_conformance.py <slug> <elementId>` and fix any flag.
You never set `approved` — the SME re-approves the element on the card.

## Step 4 — Close the loop

Once every comment has a decision:
1. **Resolve the handled comments** — every comment decided **[I]** or **[D]**
   (not the **[S]** ones):
   `python3 scripts/wiki/notes.py resolve <slug> <elementId> <noteId> [<noteId> ...]`.
2. **Post the summary** — write a short summary note to a temp file: what was
   incorporated and the element edit it produced, what was declined and the SME's
   reason, and anything left open. Then post it as the owning analyst:
   `python3 scripts/wiki/notes.py summary <slug> <elementId> "<Analyst Name>" <file>`.

Then confirm to the SME with this **exact** line, substituting the counts:

> Reviewed **{n}** comment(s) on **{elementId}** — {i} incorporated, {d}
> declined, {s} left open. Summary posted to the discussion.

## Scope

You review the comments on **one** element per run, for the element you were
invoked on. You edit only that element, always `status: draft` — the SME
re-approves it on the card; you never set `approved`. You decide nothing for the
SME. The closing summary note and the `resolved` marks are the only things you
write to `notes.json`.

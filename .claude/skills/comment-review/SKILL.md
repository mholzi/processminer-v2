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

You do the judgement — read, assess, discuss, draft; the native AI tools do the mechanical writes (the element edit, the thread updates).

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
- Use the `getTemplate({ type })` tool for the element's type, so any edit you make keeps every block and field conformant.
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
- a single block — use the `updateElement({ id, patch: { block: { heading: "<heading>", content: "new block text" } } })` tool;
- a frontmatter field — use the `updateElement({ id, patch: { field: { key: "<key>", value: "<value>" } } })` tool;
- a relation id-list — use the `updateElement({ id, patch: { list: { key: "<key>", ids: "<ids>" } } })` tool;
- a broad rewrite — use the `updateElement({ id, element })` tool for a full replacement.

Any edit re-opens the element's approval — the tools handle that. Then use the `checkConformance({ slug, elementId })` tool and fix any flag.
You never set `approved` — the SME re-approves the element on the card.

**Flag the elements the change implicates.** An incorporated change can make a
*linked* element stale — the same fact, now described differently in two
places. A control's "Control activity" restates what its process-step does; a
step's output is an exception's input; a role's responsibilities echo the steps
it owns. You may not edit those elements (scope: one element per run) — but you
must not let the drift pass silently. For each **[I]** that changed a fact,
read the edited element's relations (`step`, `systems`, `controls`, `affects`,
the steps a control links to) and judge which linked elements now describe the
same fact at odds with the new text. List every such element — by id — for the
Step 4 summary; if a linked element is squarely contradicted, also post a short
discussion comment on *that* element naming the change, so its own
`comment-review` will pick it up. Naming the implicated elements is the only
safe substitute for editing them.

## Step 4 — Close the loop

Once every comment has a decision:
1. **Resolve the handled comments** — every comment decided **[I]** or **[D]**
   (not the **[S]** ones):
   use the `resolveNotes({ noteIds: [<noteId>, ...] })` tool.
2. **Post the summary** — write a short summary note to a temp file: what was
   incorporated and the element edit it produced, what was declined and the SME's
   reason, anything left open, and — from Step 3 — any **linked elements the
   change implicates**, named by id, so the SME knows where the wiki may now be
   inconsistent. Then post it as the owning analyst:
   use the `createNote({ elementId, author: "<Analyst Name>", content: "summary note text", type: "summary" })` tool.

Then confirm to the SME with this **exact** line, substituting the counts:

> Reviewed **{n}** comment(s) on **{elementId}** — {i} incorporated, {d}
> declined, {s} left open. Summary posted to the discussion.

## Scope

You review the comments on **one** element per run, for the element you were
invoked on. You edit only that element, always `status: draft` — the SME
re-approves it on the card; you never set `approved`. You decide nothing for the
SME. The closing summary note and the `resolved` marks are the only things you
write to `notes.json`.
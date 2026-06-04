---
name: conflict-resolution
description: >-
  Resolve the conflicts a document ingest flagged — where a re-ingested
  document contradicts content the wiki already holds. Walk the SME through
  each conflict in the chat, document version versus wiki version, apply their
  decision, and clear the resolved conflicts. Use this whenever a process has
  ingest conflicts to work through, or the user asks to resolve conflicts.
---

# Conflict Resolution

You resolve the **conflicts** a `document-ingest` flagged — the places where a
re-ingested document contradicted content already in the wiki. `document-ingest`
never overwrites on a conflict; it records each one and leaves the wiki element
untouched. You walk the SME through those conflicts and apply their decision.

You are invoked with a process `<slug>`. This is interactive — the SME is
present and decides every conflict; you never resolve one yourself.

## Step 1 — Read the conflicts

Read the `ingest` field in the process JSON `wiki/processes/<slug>.json`. Its `conflicts` array holds each
flagged conflict: the `element` id, the `field` (a block heading or a
frontmatter field), what the document said (`documentSays`) and what the wiki
holds (`wikiSays`).

If the array is empty, reply with exactly:

> No conflicts to resolve for this process — nothing was contradicted on the
> last ingest.

and stop. Otherwise tell the SME how many conflicts there are, and begin.

## Step 2 — Resolve each conflict — D / W / E

Take the conflicts in order. For each, present it plainly:

> **Conflict {n} of {total} — {element id} · {field}**
>
> - **The document says:** {documentSays}
> - **The wiki says:** {wikiSays}
>
> **[D] Take the document version** · **[W] Keep the wiki version** ·
> **[E] Edit — write a merged version**

- **[W]** — keep the wiki as it is. Nothing is written.
- **[D]** — the document wins. Apply the document's version with the `updateElement` tool — it changes only the conflicted part and leaves the rest
  of the element byte-identical, so you never re-type the whole element:
  - a block conflict — `use the updateElement({ id, patch }) tool` (where `patch` specifies the block heading and new content)
  - a frontmatter field — `use the updateElement({ id, patch }) tool` (where `patch` specifies the field key and new value, or a list of IDs for relations)
- **[E]** — neither is right alone. Work the merged value out with the SME,
  then apply it with the `updateElement` tool exactly as in [D].

Apply each decision before moving to the next conflict — never batch. After a
[D] or [E] write, `use the checkConformance({ elementId }) tool` and fix any flag.

## Step 3 — Clear the resolved conflicts

When every conflict has been decided, `use the clearConflicts() tool` — it empties the `conflicts`
array in the process JSON's `ingest` field so the triage screen no longer flags them.

## Step 4 — Report

Report with the canonical template:
```
Conflict resolution complete — **{process}**:

- **Document version taken:** {n}
- **Wiki version kept:** {n}
- **Merged:** {n}

The conflicts are cleared. Review any changed elements on the cards.
```
Substitute the `{process}` and `{n}` counts. Reproduce every other character exactly; this is the single source of truth, never write the report from memory.

## Scope

You resolve the conflicts in the process JSON's `ingest` field and nothing else. You change only
the conflicted field or block of an element, never the rest of it. Everything
you write stays `status: draft` — the SME approves it in the app. You never
invent a resolution; the SME decides every conflict.

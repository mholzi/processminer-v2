---
name: area-summary
description: >-
  Generate an executive summary of one area of a process wiki — As-Is Process,
  Risk & Compliance, Client Experience, Innovation, Target Process or IT
  Architecture — written
  as an Amazon-style narrative memo. Read every section in the area and write
  the memo into the process's `summaries` field for the app to render.
  Non-interactive: no SME
  questions, no approval loop. Invoked by a button. Use this whenever the user
  wants an executive summary of an area.
---

# Area Summary

You generate an **executive summary of one area** of a process wiki and store
it where the app can render it. You are invoked with a process `<slug>` and an
`<area>` id (one of `as-is`, `risk-compliance`, `client-experience`,
`innovation`, `target`, `it-architecture`).

You are non-interactive — you read, write and report. No SME questions, no
approval loop. This is a silent generation, like `source-cx`.

## Step 1 — Read the area

Read `schema/process-schema.json`, find the area by its id, and note the
sections it contains. Read **every element across all of those sections** with
`expandElement({ type })` (then `expandElement({ type, id })` for specifics),
and the process overview (root `meta`/`content`) in the Document Map for the
process context — what the process is and its domain. An area with no elements gets a summary that
plainly says it is not yet documented.

## Step 2 — Write it as an Amazon-style narrative memo

Write the summary the way Amazon writes its memos — a **narrative**, not a
slide. These rules define the style and are not optional:

- **Full sentences and paragraphs. No bullet points, no fragments.** Where you
  are tempted to make a list, write a sentence that connects the items and
  says what they mean together. The discipline of prose is the point — it
  forces and exposes clear thinking.
- **It tells a story that flows** — context, then the substance, then the
  honest read, then the recommendation. Each paragraph follows from the last.
- **Specific and measurable.** Name elements by their title, cite ids and real
  figures from the wiki — "three of the eight steps carry no control" beats
  "some steps lack controls."
- **It stands on its own.** A reader who sees only this memo understands the
  state of the whole area in a couple of minutes.

Use **exactly these four `##` headings**, with narrative prose under each:

## Introduction
What this area covers, the process it belongs to, and why it matters.

## Current state
The substance — what the area's sections actually document, told as a flowing
narrative that connects the sections, with the specific elements and figures.
This is the heart of the memo and its longest part.

## What stands out
The candid read — what is strong across the area, and what is missing, thin,
unreviewed or inconsistent between its sections. Honest prose, not a list of
caveats.

## Recommendation
What should happen next across this area, and why.

Ground every statement in the area's actual elements — never invent. If the
area has no elements, say so plainly, in the same narrative voice.

## Step 3 — Store it

Save the summary markdown to a temp file, then use the writeSummary({ slug, area, summary }) tool.

It stores the summary in the process's `summaries` field, keyed by area — what
the app's summary panel reads. The tool checks the memo has exactly the four headings
above, in order; if it errors, fix the headings and run it again.

Then report exactly one line:

> Executive summary generated for the {area} area.

## Scope

You summarise one area per run. You write only the summary — you never create,
edit or approve elements, and never touch any area but the one you were
invoked for. Everything you state must trace to the area's elements.
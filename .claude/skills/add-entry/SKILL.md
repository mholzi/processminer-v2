---
name: add-entry
description: >-
  Add a single new element to a process wiki section, AI-drafted. Read the
  section's context, ask the SME in the chat what they want to add, research it
  in the wiki and — where useful — on the web, draft an initial proposal,
  refine it with the SME, and write it on approval. Use this whenever the user
  wants to add an entry or element to a section — a market trend, innovation
  idea, competitor, CX benchmark or any other element type.
---

# Add Entry

You add **one new element** to a section of a process wiki — AI-drafted,
researched, and refined with the SME before it is written. You are invoked
with a process `<slug>` and a `<section>` id.

You do the judgement — ask, research, draft, refine — and the native tools
do the mechanical write. This is the interactive, single-entry
counterpart to the bulk `source-innovation` / `source-cx` skills.

## Step 1 — Read the section's context

`use the getSectionContext({ slug, section }) tool` **once** — it returns
everything Step 1 needs in one call, so you never re-recall the element shape:

- **`types`** — the element type(s) this section holds, each as a fill-in-the-
  blanks **skeleton**: the `blocks` (the `##` headings to write), the `fields`
  (type-specific frontmatter, with hints), the `relations` (each with the
  element type(s) it may point at), and **`required`** (the frontmatter keys
  that must be present — drop one and conformance fails). Draft against this
  skeleton; do not recall the shape from the schema by memory.
- **`existing`** — the section's current elements (`id` + `title`), so the new
  entry fits and does not duplicate one already there (see the duplicate check
  in Step 3).
- **`overview`** — the process overview (domain, what it does), for context.

If `types` holds more than one element type, note them (you pick the right one
from the SME's description in Step 3). `expandElement({ type, id })` is still
available if you need a specific existing element's full body.

## Step 2 — Ask what to add

Ask the SME in the chat, substituting the section label:

> What would you like to add to **{section label}**? Describe it in a sentence
> or two — I'll research it and draft a proposal you can refine.

Wait for their answer.

## Step 3 — Research, then draft

**Duplicate check first.** Compare the SME's description against the `existing`
titles from Step 1; if it looks close to one already there, also
`use the searchProcesses({ query }) tool` to confirm. If it is a near-duplicate,
say so and ask whether to extend the existing element instead of drafting a new
one — don't silently create a second copy.

Research the entry before drafting — never draft from a blank guess:
- **Always** read the related wiki elements — for an innovation idea, the pain-
  and friction-points it might address; for a control, the process steps; for
  a competitor move, the trends and the As-Is. The entry must connect to what
  the wiki already holds.
- **Use web search** when the entry is an external signal — a market trend, a
  competitor move, a CX benchmark — or when the SME's request needs facts you
  do not have. Cite the real source; never invent one. When the entry needs
  several external signals (e.g. the trend, a competitor and a benchmark),
  **dispatch the searches concurrently as read-only sub-agents** in one message
  rather than running them serially, then merge the findings.

Then draft the element against the Step-1 **skeleton** for the chosen type —
fill **every** `block`, **every** `field`, and **every** `required` relation it
lists (for a web-sourced type that means `sourceUrl`, `asOf` and the rest — do
not leave them off), an honest `confidence`, and a `source` (the SME, the wiki
element, or the study/URL the research found). Because you draft straight into
the skeleton, no required field is dropped and the post-write conformance check
passes first time.

**Pre-fill the relations.** Each relation in the skeleton names the element
type(s) it may point at; match the SME's description (and your research) against
those target sections and **pre-populate the relation id-lists** for the SME to
confirm in Step 4 — relations are the field most often left empty, and grounding
the entry is the point.

If the section holds several element types, pick the type from what the SME
described; if it is genuinely ambiguous, ask which.

## Step 4 — Refine with the SME — Y / E / R

Present the draft and offer exactly three choices:
- **[Y] Yes** — accept the draft. Write the element as `status: draft`; the
  SME approves it later in the app, not here.
- **[E] Edit** — apply the SME's corrections, show the result, ask again.
- **[R] Rewrite** — the draft missed; redraft (sharper questions, more
  research) and re-present.

Loop until [Y]. Always offer all three.

## Step 5 — Write it

While drafting and presenting (Steps 3–4) the element has no id yet — refer to
it by description, never guess an id. The id is assigned here, at write time.

On **[Y]**:
1. Assemble an element object (`title`, `confidence`, `source`, the scalar
   frontmatter fields, the relation id-lists and the blocks) and use the
   `createElement({ type, element })` tool — `status: draft`. **Do not set an
   id**: the backend assigns it and returns it in the result.
2. use the `checkConformance({ slug })` tool — fix any flag.

Then confirm with this **exact** line, substituting the id, title and section:

> Added **{id}** — *{title}* — to **{section label}**. Review it on the card.

## Scope

You add **one** element per run, to the section you were invoked for.
Everything you write is `status: draft` — the SME reviews it on the card
(approval, or the relevance triage for web-sourced types); you never set
`approved` or `relevance` yourself. You never write content you cannot ground
in the wiki, the SME, or a real source. To add to a different section, the SME
runs you again from that section.
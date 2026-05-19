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

You do the judgement — ask, research, draft, refine — and the Python scripts in
`scripts/wiki/` do the mechanical write. This is the interactive, single-entry
counterpart to the bulk `source-innovation` / `source-cx` skills.

## Step 1 — Read the section's context

- Read `schema/process-schema.json` for the section — the element type(s) it
  holds. For each of those types run `python3 scripts/wiki/show_template.py
  <type>`: it prints the type's `## ` blocks **and** its type-specific
  frontmatter fields and relations, so the entry you draft is as complete as
  one the dedicated sourcing skills produce.
- Read the section's existing elements in `wiki/processes/<slug>/<section>/`
  so the new entry fits and does not duplicate one already there.
- Read `index.md` for the process — its domain, what it does, its scope.

If the section holds more than one element type, note them.

## Step 2 — Ask what to add

Ask the SME in the chat, substituting the section label:

> What would you like to add to **{section label}**? Describe it in a sentence
> or two — I'll research it and draft a proposal you can refine.

Wait for their answer.

## Step 3 — Research, then draft

Research the entry before drafting — never draft from a blank guess:
- **Always** read the related wiki elements — for an innovation idea, the pain-
  and friction-points it might address; for a control, the process steps; for
  a competitor move, the trends and the As-Is. The entry must connect to what
  the wiki already holds.
- **Use web search** when the entry is an external signal — a market trend, a
  competitor move, a CX benchmark — or when the SME's request needs facts you
  do not have. Cite the real source; never invent one.

Then draft the element: every block per its schema `template`, **every
frontmatter field and relation `show_template.py` listed for the type** (for a
web-sourced type that means `sourceUrl`, `asOf` and the rest — do not leave
them off), an honest `confidence`, and a `source` (the SME, the wiki element,
or the study/URL the research found). If the
section holds several element types, pick the type from what the SME
described; if it is genuinely ambiguous, ask which.

## Step 4 — Refine with the SME — Y / E / R

Present the draft and offer exactly three choices:
- **[Y] Yes** — accurate, accept it. Write the element.
- **[E] Edit** — apply the SME's corrections, show the result, ask again.
- **[R] Rewrite** — the draft missed; redraft (sharper questions, more
  research) and re-present.

Loop until [Y]. Always offer all three.

## Step 5 — Write it

While drafting and presenting (Steps 3–4) the element has no id yet — refer to
it by description, never guess an id. The id is assigned here, at write time.

On **[Y]**:
1. `python3 scripts/wiki/next_id.py <slug> <type>` — the id.
2. Assemble a JSON spec (`slug`, `type`, `id`, `title`, `confidence`,
   `source`, `fields` for scalar frontmatter, `relations` for id-lists,
   `blocks`), save it to `/tmp/<id>.json`, then
   `python3 scripts/wiki/write_element.py /tmp/<id>.json` — `status: draft`.
3. `python3 scripts/wiki/check_conformance.py <slug> <id>` — fix any flag.

Then confirm with this **exact** line, substituting the id, title and section:

> Added **{id}** — *{title}* — to **{section label}**. Review it on the card.

## Scope

You add **one** element per run, to the section you were invoked for.
Everything you write is `status: draft` — the SME reviews it on the card
(approval, or the relevance triage for web-sourced types); you never set
`approved` or `relevance` yourself. You never write content you cannot ground
in the wiki, the SME, or a real source. To add to a different section, the SME
runs you again from that section.

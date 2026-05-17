---
name: source-innovation
description: >-
  Autonomously source the innovation perspective of a process from the web —
  search for market studies, analyst reports and trends, and scan what
  competitor banks and fintechs are doing, then fill the Market Trends,
  Competitor and Innovation Ideas sections with draft elements. Non-interactive:
  no SME questions, no approval loop. Invoked by a button or another skill. Use
  this whenever the user wants to auto-source, web-source or pre-fill market
  trends, competitor moves or innovation ideas for a process.
---

# Source Innovation

You autonomously source a process's **innovation perspective** from the web —
you search for what is changing in the process's domain, scan what competitors
are doing, and write the findings into the wiki as `market-trend`, competitor-
move and `innovation-idea` draft elements. You are invoked with a process
`<slug>`, by a UI button or another skill.

This is the web-research analogue of `document-ingest`: it extracts from an
uploaded document, you extract from the live web. The deep, interactive
forward-looking work — risks, target state, transformation, refining ideas with
the SME — is `innovation-analyst`'s; you only do the fast sourcing pass.

**You are non-interactive.** No SME is present. You ask nothing, you run no
approval loop — you read, search, draft, write, and report. Everything you
write is `status: draft`; the SME reviews and approves it later in the app.

## What you produce

| Element | Section | What it captures |
|---|---|---|
| market-trend | `market-trends` | an external trend, technology shift or market move |
| competitor-eu | `competitor-innovation` | an innovation a European corporate bank is pursuing |
| competitor-global | `competitor-innovation` | an innovation a global corporate bank is pursuing |
| competitor-fintech | `competitor-innovation` | an innovation a fintech is pursuing |
| innovation-idea | `innovation-ideas` | an idea to improve the process |

You do **not** produce innovation-risks, target-state, transformation-decision
or gap elements — those are `innovation-analyst`'s, with the SME.

## The wiki you write into

**Read `schema/process-schema.json` first** — it defines, per element type, the
`section`, the `idPrefix` (TR, CEU, CGL, CFT, II) and the `template` (the named `## ` blocks,
their format and word range). The scripts in `scripts/wiki/` own the file
format; you do the judgement. Read an existing element of the type under
`wiki/processes/cob-003/` as a worked example when unsure of the frontmatter.

## Step 1 — Read the process

Read `wiki/processes/<slug>/index.md` (the domain — what the process does, its
industry, its scope) and the documented As-Is, **especially the pain-points and
friction-points** — innovation ideas address those. Also read any existing
`market-trend`, competitor and `innovation-idea` elements: you extend, you
never duplicate an element the wiki already holds.

## Step 2 — Scan the web

Build search queries from the process — its title, what it does, its industry
(banking) and the specific sub-domain (for a client-onboarding process: KYC
automation, digital identity, onboarding experience). Use the web search and
web-fetch tools: run several searches and read a promising study or analyst
report in depth. Gather the trends that genuinely bear on *this* process — not
a generic industry dump.

If web search is unavailable in this environment, write what your own domain
knowledge solidly supports, at `low` confidence, and say so in the summary —
**never fabricate a study or a source.**

## Step 3 — Write market trends

For each trend that matters to this process, draft a `market-trend` element per
its schema template. **Ground every claim in a source you actually found** — a
claim you cannot trace to a study or report does not go in.

The three blocks: *The trend* — the trend plainly; *Relevance* — why it matters
for this process; *Evidence* — the **specific figure or statistic** behind it
(*"abandonment 70%, up from 48% in 2023"*), the data point, not a re-listing of
who published it.

Each element's frontmatter carries:
- `source:` the study or publication name; `sourceUrl:` its URL — store the
  link, a reviewer must be able to click through.
- `asOf:` today's date (ISO `YYYY-MM-DD`) — trends decay; this records when it
  was sourced.
- `horizon:` one of `regulatory-deadline` (a dated compliance obligation),
  `near-term` (already arriving), `emerging` (a longer-range direction).
- `bearsOn:` a relation — the ids of the process elements the trend bears on
  (steps, systems, pain-points), drawn from the As-Is you read in Step 1.

Then write it: `next_id.py` → `write_element.py` (`status: draft`,
`confidence: medium` — web-sourced, not yet SME-validated; `low` if thinly
supported) → `check_conformance.py`. Aim for the handful of trends that are
genuinely material — not an exhaustive list.

## Step 4 — Scan competitors and write competitor moves

Scan what competitors are doing in this process's domain, in **three tiers, in
this order** — the order reflects how close each set is to the bank:

1. **European corporate banks** — the closest competitive set. Search named
   European peers and what they are doing in this domain → `competitor-eu`.
2. **Global corporate banks** — the major global players → `competitor-global`.
3. **Fintechs** — the challengers and specialists reshaping this space →
   `competitor-fintech`.

For each tier, web-search for **named** competitors' moves in this domain —
product launches, platform investments, announcements, analyst write-ups — and
write one element per material move:
- Blocks: *The move* — what the competitor is doing; *Relevance* — the
  competitive gap it opens for this process; *Evidence* — the announcement,
  report or launch.
- Frontmatter: `competitor:` the named bank or fintech; `source:` /
  `sourceUrl:` / `asOf:` as for market trends; `bearsOn:` the process elements
  the move bears on.
- Write each with `next_id.py` → `write_element.py` (`status: draft`,
  `confidence: medium`; `low` if thinly evidenced) → `check_conformance.py`.

Name **real** competitors and cite **real** sources — never invent a
competitor or a move. A handful of material moves per tier, not a dump.

## Step 5 — Write innovation ideas

Derive `innovation-idea` elements from the trends, the competitor moves and the
documented pain- and friction-points. Every idea must `addresses` at least one
real documented pain- or friction-point id — an idea that solves no documented
problem is not written. Each element's frontmatter carries:
- `addresses:` **every** pain-point, friction-point or process-gap the idea
  genuinely relieves — not just one. A unified-workspace idea that removes
  re-keying *and* slow handovers links both.
- `fromTrend:` the `market-trend` id(s) the idea derives from.
- `fromCompetitor:` the competitor-move id(s) the idea is inspired by, if any —
  so an idea traces idea → trend/competitor → source.

Draft per template, write with the same three scripts (`status: draft`,
`confidence: low`–`medium` — these are unvalidated proposals). Run conformance.

## Step 6 — Report

Report with this **exact template**, substituting the counts:

> Innovation sourced for **{process}** from the web:
>
> - **Market trends:** {n} drafted
> - **Competitor moves:** {n} drafted — {e} European, {g} global, {f} fintech
> - **Innovation ideas:** {n} drafted — each linked to the pain or friction it addresses
>
> Sources: {comma-separated list of the studies / reports used}
>
> All are `status: draft` — review and approve them in the app, or run the
> innovation-analyst for the deeper forward-looking work.

If web search was unavailable, add one line saying so before the sources line.

## Scope

You source market trends, competitor moves and innovation ideas, nothing else.
You never ask the SME anything, never run an approval loop, never set
`approved`. You never duplicate an element the wiki already holds. You never
write a trend, competitor move or idea you cannot ground in a real source, and
you never invent a competitor.

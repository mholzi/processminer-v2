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
forward-looking work — refining the ideas and weighing their risks with the
SME — is `innovation-analyst`'s; the Target Process is the
`transformation-agent`'s. You only do the fast sourcing pass.

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

You do **not** produce innovation-risks — those are `innovation-analyst`'s —
nor the Target Process: target-state, transformation-decision and gap elements
are the `transformation-agent`'s. All need the SME.

## The wiki you write into

**Get your element templates up front.** Run
`python3 scripts/wiki/show_template.py <type> …`, passing the `type` of every
element you draft (the types listed under "What you produce"). For each it
prints — from `schema/process-schema.json` — the `section`, the `idPrefix`, the
frontmatter (fields with their allowed values, the required keys, the
relations) and the `## ` blocks with their format and word range. That is the
full contract — you do **not** read the whole schema file. The scripts in
`scripts/wiki/` own the file format; you do the judgement.

## Step 1 — Read the process

Read `wiki/processes/<slug>/index.md` (the domain — what the process does, its
industry, its scope) and the documented As-Is, **especially the pain-points and
friction-points** — innovation ideas address those. Also read any existing
`market-trend`, competitor and `innovation-idea` elements: you extend, you
never duplicate an element the wiki already holds.

Read **wider than the happy-path spine**. Two things the documented As-Is
carries that sourcing routinely misses:
- **The control and regulatory angle.** Read the `control`, `control-gap`,
  `compliance-gap` and `audit-finding` elements. A control gap is as real an
  improvement target as a pain-point — innovation ideas address those too, and
  trends about evolving supervisory expectations bear directly on them.
- **Automated / straight-through branches.** A process step often has an
  automated or STP variant alongside the manual one. Trends and competitor
  moves about automation, agentic AI and continuous controls bear on the
  *automated* branch — not only the manual steps. Account for both.

**Fill any pending elements first.** An element with `sourceUrl: pending` is a
draft the `innovation-analyst` wrote but could not cite — it is waiting for
exactly this skill. Before sourcing anything fresh, for each pending element:
web-search to verify its claim, then attach the real `source` and `sourceUrl`
with `python3 scripts/wiki/patch_element.py`, and raise `confidence` from `low`
if the web confirms it. If the web does not support the claim, leave it
`pending` and say so in the Step 6 report. Never duplicate a pending element
with a freshly-sourced one — fill it in place.

## Step 2 — Fan out the web scans

Before the first write, clear the run manifest —
`python3 scripts/wiki/reset_manifest.py <slug>`. Every element you write is
logged to it; Step 4's report counts are read back from the manifest, not
tallied from memory.

The market-trend scan and the three competitor tiers are independent
web-research streams, so scan them **concurrently**: in a single message,
dispatch **four sub-agents** with the Task tool — one for trends plus one per
competitor tier — and wait for all four.

| Stream | Type | Who / what |
|---|---|---|
| Market trends | `market-trend` | external trends, technology shifts, market moves |
| European corporate banks — the closest competitive set | `competitor-eu` | named European peers |
| Global corporate banks | `competitor-global` | the major global players |
| Fintechs | `competitor-fintech` | the challengers and specialists reshaping this space |

Give the **market-trend** sub-agent this brief:

> You are sourcing market trends for process `<slug>` (element type
> `market-trend`). Read `wiki/processes/<slug>/index.md`, the documented
> As-Is — **especially `pain-points`, `friction-points`, `controls`,
> `control-gap`s, `compliance-gap`s and `audit-finding`s** — and any
> existing `market-trend` elements so you do not duplicate one. Run `python3
> scripts/wiki/show_template.py market-trend` for the element's shape.
> Web-search for analyst reports, market studies and technology shifts that
> bear on *this* process — including evolving supervisory expectations and
> automation / agentic-AI trends, which bear on the STP branch and the
> control gaps, not only the manual happy-path steps. Draft one
> `write_element.py` spec per material trend: blocks *The trend* / *Relevance*
> / *Evidence* (the **specific figure or statistic**, not who published it);
> frontmatter `source:`, `sourceUrl:`, `bearsOn:` the process elements it
> bears on (steps including STP branches, systems, pain-points, controls,
> control-gaps); `status: draft`, `confidence: medium` (`low` if thinly
> supported); a `provenance` map, one entry per block heading, every entry
> `{ "source": "web", "evidence": "<url> — \"<snippet>\" — fetched <date>" }`.
> Give each spec a `tempKey` prefixed `"trend-…"` so an idea can reference it
> later. Ground every claim in a real source; never fabricate a study. If
> web search is unavailable, write only what your domain knowledge solidly
> supports at `low` confidence and say so in the return. A handful of trends
> that are genuinely material, not an exhaustive list. You are **read-only**
> — do not write or run any write script. Return **only** a JSON array of
> the draft specs.

Give each **competitor** sub-agent this brief, filling in its tier:

> You are sourcing competitor moves for process `<slug>`, tier **{tier}**
> (element type `{type}`). Read `wiki/processes/<slug>/index.md` and the
> documented As-Is for context, and the existing `{type}` elements so you do
> not duplicate one. Run `python3 scripts/wiki/show_template.py {type}` for
> the element's shape. Web-search for **named** {who}'s moves in this
> process's domain — product launches, platform investments, announcements,
> analyst write-ups. Draft one `write_element.py` spec per material move:
> blocks *The move* / *Relevance* / *Evidence*; frontmatter `competitor:`,
> `source:`, `sourceUrl:`, and `bearsOn:` the process elements it bears on;
> `status: draft`, `confidence: medium` (`low` if thinly evidenced); a
> `provenance` map, one entry per block heading, every entry
> `{ "source": "web", "evidence": "<url> — \"<snippet>\" — fetched <date>" }`.
> Give each spec a `tempKey` prefixed with the type — `"{type}-1"`,
> `"{type}-2"`, … — so keys never collide between streams. Name **real**
> competitors and cite **real** sources; never invent one. A handful of
> material moves, not a dump. You are **read-only** — do not write or run any
> write script. Return **only** a JSON array of the draft specs.

Collect the four arrays and hold the drafts for the Step 3 batch write.

## Step 3 — Draft innovation ideas, then write the run

Derive `innovation-idea` elements from the trends, the competitor moves and the
documented problems. Every idea must `addresses` at least one real documented
problem id — an idea that solves no documented problem is not written. Each
element's frontmatter carries:
- `addresses:` **every** pain-point, friction-point, process-gap or
  control-gap the idea genuinely relieves — not just one. A unified-workspace
  idea that removes re-keying *and* slow handovers links both; an automated-
  control idea links the control gap it closes.
- `fromTrend:` the trend(s) the idea derives from — written as `"@<tempKey>"`,
  the temp keys the market-trend sub-agent gave them in Step 2.
- `fromCompetitor:` the competitor move(s) the idea is inspired by, if any, as
  `"@<tempKey>"` from a competitor sub-agent in Step 2 — so an idea traces
  idea → trend/competitor → source.

Draft each idea per template (`status: draft`, `confidence: low`–`medium` —
these are unvalidated proposals). Then write the **whole run in one batch**:
assemble a manifest `{ "slug": "<slug>", "elements": [ … ] }` of every trend
and every competitor move from Step 2 and every idea here — each spec
omitting `id`, each carrying its `tempKey`, ideas referencing trends and moves
by `"@<tempKey>"` — and run `python3 scripts/wiki/write_elements.py
/tmp/<slug>-elements.json`, then `python3 scripts/wiki/check_conformance.py
<slug>`. The batch writer assigns every id and resolves every `@<tempKey>`.

**Completeness check — every documented problem gets an idea.** Once the ideas
are written, run `python3 scripts/wiki/idea_coverage.py <slug>`. It enumerates
every pain-point, friction-point, process-gap and control-gap in the process
and checks each is named by some idea's `addresses` list, printing `covered`
and `uncovered` ids as JSON — set arithmetic, not your recollection. While it
reports `"complete": false`, work the `uncovered` ids: a control gap with no
idea against it is exactly the omission to catch. For each, either write an
idea that `addresses` it, or — if no improvement genuinely applies — leave it
and note the deliberate gap in the Step 4 report. Do not leave Step 3 until
`idea_coverage.py` reports `"complete": true`, or every still-`uncovered` id is
a conscious decision.

## Step 4 — Report

Run `python3 scripts/wiki/source_report.py <slug>` — it reads the run manifest
and prints how many elements were written, per type. Map those counts into the
template: `market-trend` → Market trends; `competitor-eu` / `-global` /
`-fintech` → the Competitor moves total and its European / global / fintech
split; `innovation-idea` → Innovation ideas. Do not recount from memory.

Report with the canonical template: run `python3 scripts/wiki/verbatim.py
source-innovation-report` and present what it prints, substituting the
counts. The two `{if …}` blocks are conditional — keep a block (its fixed
wording exactly as printed) when its condition holds, omit the whole block
when it does not. Reproduce every other character exactly; `verbatim.py` is
the single source of truth, never write the report from memory.

## Scope

You source market trends, competitor moves and innovation ideas, nothing else.
You never ask the SME anything, never run an approval loop, never set
`approved`. You never duplicate an element the wiki already holds. You never
write a trend, competitor move or idea you cannot ground in a real source, and
you never invent a competitor.

<!-- WEB-PROVENANCE-BLOCK:start -->
## Provenance — web-sourced content is unconfirmed

This block is identical in the three web-sourcing skills (HALLUCINATION-PLAN.md).
Do not edit one copy — a drift check fails CI.

You source from the web with no SME present. Every element you write is
therefore **unconfirmed** until a specialist refines it with the SME. Record
that honestly in the `provenance` map of the `write_element.py` spec — one
entry per block heading, every entry `source: web`:

    "provenance": {
      "The trend":  { "source": "web",
                      "evidence": "<url> — \"<verbatim snippet>\" — fetched <YYYY-MM-DD>" },
      "Relevance":  { "source": "web", "evidence": "<url> — \"...\" — fetched <YYYY-MM-DD>" },
      "Evidence":   { "source": "web", "evidence": "<url> — \"...\" — fetched <YYYY-MM-DD>" }
    }

`evidence` is the page URL, the verbatim snippet you drew the claim from, and
the date you fetched it — a web page mutates, so the snippet is the durable
record. A `web` heading carries no SME confirmation, so `set_approval.py`
**blocks approval** of the element until the owning specialist walks it through
the SME, at which point each confirmed heading flips to `elicited`. Do not try
to approve a web-sourced element yourself.
<!-- WEB-PROVENANCE-BLOCK:end -->

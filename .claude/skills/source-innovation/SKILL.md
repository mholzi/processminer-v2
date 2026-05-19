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

**Read `schema/process-schema.json` first** — it defines, per element type, the
`section`, the `idPrefix` and the `template` (the named `## ` blocks, their
format and word range). The scripts in `scripts/wiki/` own the file format; you
do the judgement. When unsure of an element type's exact shape, run
`python3 scripts/wiki/show_template.py <type>` — it prints the section, id
prefix and blocks straight from the schema.

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

Before the first write, clear the run manifest —
`python3 scripts/wiki/reset_manifest.py <slug>`. Every element you write is
logged to it; Step 6's report counts are read back from the manifest, not
tallied from memory.

For each trend that matters to this process, draft a `market-trend` element per
its schema template. **Ground every claim in a source you actually found** — a
claim you cannot trace to a study or report does not go in.

The three blocks: *The trend* — the trend plainly; *Relevance* — why it matters
for this process; *Evidence* — the **specific figure or statistic** behind it
(*"abandonment 70%, up from 48% in 2023"*), the data point, not a re-listing of
who published it.

Each element's frontmatter — `show_template.py market-trend` lists every field
and the allowed values for the enumerated ones (e.g. `horizon`). Notes
specific to sourcing:
- `source:` / `sourceUrl:` — the study or publication and its URL; a reviewer
  must be able to click through.
- `asOf:` — leave it out; `write_element.py` auto-stamps today's date.
- `bearsOn:` the ids of the process elements the trend bears on — steps
  (manual *and* automated/STP branches), systems, pain-points, and any
  `control` or `control-gap` the trend speaks to. A trend about automated
  controls or agentic AI bears on the STP branch and the control gaps, not
  just the manual steps — link those, not only the happy path.

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
documented problems. Every idea must `addresses` at least one real documented
problem id — an idea that solves no documented problem is not written. Each
element's frontmatter carries:
- `addresses:` **every** pain-point, friction-point, process-gap or
  control-gap the idea genuinely relieves — not just one. A unified-workspace
  idea that removes re-keying *and* slow handovers links both; an automated-
  control idea links the control gap it closes.
- `fromTrend:` the `market-trend` id(s) the idea derives from.
- `fromCompetitor:` the competitor-move id(s) the idea is inspired by, if any —
  so an idea traces idea → trend/competitor → source.

Draft per template, write with the same three scripts (`status: draft`,
`confidence: low`–`medium` — these are unvalidated proposals). Run conformance.

**Completeness check — every documented problem gets an idea.** Once the ideas
are written, run `python3 scripts/wiki/idea_coverage.py <slug>`. It enumerates
every pain-point, friction-point, process-gap and control-gap in the process
and checks each is named by some idea's `addresses` list, printing `covered`
and `uncovered` ids as JSON — set arithmetic, not your recollection. While it
reports `"complete": false`, work the `uncovered` ids: a control gap with no
idea against it is exactly the omission to catch. For each, either write an
idea that `addresses` it, or — if no improvement genuinely applies — leave it
and note the deliberate gap in the Step 6 report. Do not leave Step 5 until
`idea_coverage.py` reports `"complete": true`, or every still-`uncovered` id is
a conscious decision.

## Step 6 — Report

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

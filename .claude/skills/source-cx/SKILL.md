---
name: source-cx
description: >-
  Autonomously source the external client-experience layer of a process from
  the web — scan how competitor banks and fintechs run the same client journey,
  and gather industry CX benchmarks and client-expectation research, then fill
  the Competitor CX and CX Benchmarks sections with draft elements.
  Non-interactive: no SME questions, no approval loop. Invoked by a button or
  another skill. Use this whenever the user wants to auto-source, web-source or
  pre-fill competitor CX or CX benchmarks for a process.
---

# Source CX

You autonomously source a process's **external client-experience layer** from
the web — how competitors run the same client journey, and what the industry
treats as the CX standard — and write the findings into the wiki as
`competitor-cx-*` and `cx-benchmark` draft elements. You are invoked with a
process `<slug>`, by a UI button or another skill.

This is the CX counterpart of `source-innovation`. **You do not document this
process's own client journey** — its channels, touchpoints, moments and
friction are the bank's own experience, captured by the SME or
`document-ingest`, not the web. You source only the *comparative* layer: what
competitors do, and what good looks like.

**You are non-interactive.** No SME is present. You ask nothing, run no
approval loop — you read, search, draft, write, and report. Everything you
write is `status: draft`; the SME reviews and approves it later in the app.

## What you produce

| Element | Section | What it captures |
|---|---|---|
| competitor-cx-eu | `competitor-cx` | how a European corporate bank runs this client journey |
| competitor-cx-global | `competitor-cx` | how a global corporate bank runs this client journey |
| competitor-cx-fintech | `competitor-cx` | how a fintech runs this client journey |
| cx-benchmark | `cx-benchmarks` | an industry CX standard or client-expectation signal |

You do **not** produce channels, touchpoints, moments or friction-points —
those are the process's own journey, `client-journey-specialist`'s and
`document-ingest`'s.

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
industry, its scope) and the documented client journey — the `channels`,
`touchpoints`, `moments` and `friction-points` elements. This tells you what
client journey to benchmark. Also read any existing `competitor-cx-*` and
`cx-benchmark` elements: you extend, you never duplicate.

## Step 2 — Scan competitor CX

Before the first write, clear the run manifest —
`python3 scripts/wiki/reset_manifest.py <slug>`. Every element you write is
logged to it; Step 4's report counts are read back from the manifest, not
tallied from memory.

The three competitor tiers are independent web-research streams, so scan them
**concurrently**: in a single message, dispatch **three sub-agents** with the
Task tool — one per tier — and wait for all three.

| Tier | Type | Who |
|---|---|---|
| European corporate banks — the closest competitive set | `competitor-cx-eu` | named European peers |
| Global corporate banks | `competitor-cx-global` | the major global players |
| Fintechs | `competitor-cx-fintech` | the challengers reshaping this experience |

Give each sub-agent this brief, filling in its tier:

> You are sourcing competitor client experience for process `<slug>`, tier
> **{tier}** (element type `{type}`). Read `wiki/processes/<slug>/index.md`
> and the documented client journey (`channels`, `touchpoints`, `moments`,
> `friction-points`) for context, and the existing `{type}` elements so you
> do not duplicate one. Run `python3 scripts/wiki/show_template.py {type}`
> for the element's shape. Web-search for **named** {who}'s client experience
> in this domain — onboarding journey, channels, speed, self-service, reviews,
> case studies. Draft one `write_element.py` spec per material example:
> blocks *The journey* / *Relevance* / *Evidence*; frontmatter `competitor:`,
> `source:`, `sourceUrl:`; `status: draft`, `confidence: medium` (`low` if
> thinly evidenced); a `provenance` map, one entry per block heading, every
> entry `{ "source": "web", "evidence": "<url> — \"<snippet>\" — fetched
> <date>" }`. Name **real** competitors and cite **real** sources; never
> invent one. A handful of material examples, not a dump. You are
> **read-only** — do not write or run any write script. Return **only** a
> JSON array of the draft specs.

Collect the three arrays and hold the drafts for the Step 3 batch write.

## Step 3 — Scan CX benchmarks

Web-search for industry CX benchmarks and client-expectation research for this
kind of process — onboarding-time standards, NPS / effort benchmarks, what
corporate clients expect (status visibility, digital self-service). Write a
`cx-benchmark` element per material benchmark:
- Blocks: *The benchmark* — the standard or expectation; *Relevance* — how this
  process measures against it; *Evidence* — the specific figure or survey.
- Frontmatter: `source:` and `sourceUrl:`. (`asOf:` is auto-stamped — leave
  it out.)
- Draft each `cx-benchmark` as a `write_element.py` spec (`status: draft`,
  `confidence: medium`; `low` if thinly evidenced).

Then write the **whole run in one batch** — assemble a manifest
`{ "slug": "<slug>", "elements": [ … ] }` of every competitor-CX example from
Step 2 and every benchmark drafted here, each spec omitting `id`, and run
`python3 scripts/wiki/write_elements.py /tmp/<slug>-elements.json`, then
`python3 scripts/wiki/check_conformance.py <slug>`.

Name **real** competitors and cite **real** sources — never invent a competitor
or a benchmark. If web search is unavailable, write only what you can solidly
support and say so in the report.

## Step 4 — Report

Run `python3 scripts/wiki/source_report.py <slug>` — it reads the run manifest
and prints how many elements were written, per type. Map those counts into the
template: `competitor-cx-eu` / `-global` / `-fintech` → the Competitor CX total
and its European / global / fintech split; `cx-benchmark` → CX benchmarks. Do
not recount from memory.

Report with the canonical template: run `python3 scripts/wiki/verbatim.py
source-cx-report` and present what it prints, substituting the counts.
Reproduce every other character exactly; `verbatim.py` is the single source
of truth, never write the report from memory.

If web search was unavailable, add one line saying so before the sources line.

**Always close the report with a one-line handoff** to the internal CX
layer. The "✦ Source from the web" CTA populates only the comparative,
external view — Channels, Touchpoints, Moments and Friction-Points are this
bank's *own* client journey and cannot be web-sourced. After the canonical
report, append one line — verbatim:

> The internal client journey (Channels, Touchpoints, Moments and Friction-Points) was not touched — those sections need the client-journey-specialist with the SME. Start it from any of those sections' empty state when ready.

This is the one place where the skill speaks past the report — without it,
a user clicking "Source from the web" on the Client Experience area can
reasonably assume the whole area has been populated. It hasn't.

## Scope

You source competitor CX and CX benchmarks, nothing else. You never document
the process's own journey, never ask the SME anything, never run an approval
loop, never set `approved`. You never duplicate an element the wiki already
holds, never write anything you cannot ground in a real source, and never
invent a competitor.

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

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

**Read `schema/process-schema.json` first** — it defines, per element type, the
`section`, the `idPrefix` (CXE, CXG, CXF, CXB) and the `template`. The scripts
in `scripts/wiki/` own the file format; you do the judgement.

## Step 1 — Read the process

Read `wiki/processes/<slug>/index.md` (the domain — what the process does, its
industry, its scope) and the documented client journey — the `channels`,
`touchpoints`, `moments` and `friction-points` elements. This tells you what
client journey to benchmark. Also read any existing `competitor-cx-*` and
`cx-benchmark` elements: you extend, you never duplicate.

## Step 2 — Scan competitor CX

Scan how competitors run *this* client journey, in **three tiers, in this
order** — the order reflects how close each set is to the bank:

1. **European corporate banks** — the closest competitive set → `competitor-cx-eu`.
2. **Global corporate banks** — the major global players → `competitor-cx-global`.
3. **Fintechs** — the challengers reshaping this experience → `competitor-cx-fintech`.

For each tier, web-search for **named** competitors' client experience in this
domain — their onboarding journey, channels, speed, self-service, reviews and
case studies. Write one element per material example:
- Blocks: *The journey* — how the competitor runs it; *Relevance* — the
  experience gap it opens for this process; *Evidence* — the review, case
  study or announcement.
- Frontmatter: `competitor:` the named bank or fintech; `source:` /
  `sourceUrl:` / `asOf:` (today's date, ISO).
- Write each with `next_id.py` → `write_element.py` (`status: draft`,
  `confidence: medium`; `low` if thinly evidenced) → `check_conformance.py`.

## Step 3 — Scan CX benchmarks

Web-search for industry CX benchmarks and client-expectation research for this
kind of process — onboarding-time standards, NPS / effort benchmarks, what
corporate clients expect (status visibility, digital self-service). Write a
`cx-benchmark` element per material benchmark:
- Blocks: *The benchmark* — the standard or expectation; *Relevance* — how this
  process measures against it; *Evidence* — the specific figure or survey.
- Frontmatter: `source:` / `sourceUrl:` / `asOf:`.

Name **real** competitors and cite **real** sources — never invent a competitor
or a benchmark. If web search is unavailable, write only what you can solidly
support and say so in the report.

## Step 4 — Report

Report with this **exact template**, substituting the counts:

> Client-experience scan complete for **{process}** from the web:
>
> - **Competitor CX:** {n} drafted — {e} European, {g} global, {f} fintech
> - **CX benchmarks:** {n} drafted
>
> Sources: {comma-separated list of the studies / reports used}
>
> All are `status: draft` — review and approve them in the app, or run the
> client-journey-specialist to refine them and document the journey itself.

If web search was unavailable, add one line saying so before the sources line.

## Scope

You source competitor CX and CX benchmarks, nothing else. You never document
the process's own journey, never ask the SME anything, never run an approval
loop, never set `approved`. You never duplicate an element the wiki already
holds, never write anything you cannot ground in a real source, and never
invent a competitor.

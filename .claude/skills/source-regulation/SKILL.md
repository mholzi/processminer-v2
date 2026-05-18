---
name: source-regulation
description: >-
  Autonomously source the regulatory perspective of a process from the web —
  search for the financial-services regulation, supervisory rules and guidance
  that govern the process, then fill the Regulation section with draft
  elements. Non-interactive: no SME questions, no approval loop. Invoked by a
  button or another skill. Use this whenever the user wants to auto-source,
  web-source or pre-fill the regulations that apply to a process.
---

# Source Regulation

You autonomously source a process's **regulatory perspective** from the web —
the regulations, supervisory rules and guidance that govern it — and write the
findings into the wiki as `regulation` draft elements. You are invoked with a
process `<slug>`, by a UI button or another skill.

This is the Risk & Compliance counterpart of `source-cx` and
`source-innovation`. You source the regulatory obligations that bear on the
process; the Control & Compliance Specialist later refines them with the SME
and maps each one to the controls that satisfy it.

**You are non-interactive.** No SME is present. You ask nothing, run no
approval loop — you read, search, draft, write, and report. Everything you
write is `status: draft`; the SME reviews and approves it later in the app.

## What you produce

| Element | Section | What it captures |
|---|---|---|
| regulation | `regulation` | a regulatory obligation the process must satisfy |

You do **not** produce controls, control gaps or audit findings — those are the
`control-compliance-specialist`'s, drawn from the SME and the process itself,
not the web.

## The wiki you write into

**Read `schema/process-schema.json` first** — it defines, per element type, the
`section`, the `idPrefix` and the `template`. The scripts in `scripts/wiki/`
own the file format; you do the judgement. When unsure of the `regulation`
element's exact shape, run `python3 scripts/wiki/show_template.py regulation` —
it prints the section, id prefix and blocks straight from the schema.

## Step 1 — Read the process

Read `wiki/processes/<slug>/index.md` — what the process does, its industry,
its jurisdiction and its scope. Read the documented As-Is process: the
`process-steps`, `roles` and `exceptions`, so you know what activity is being
regulated. Read the existing `controls` — they tell you what risks the process
already manages, and let you map a regulation to the control that satisfies it.
Read any existing `regulation` elements: you extend, you never duplicate.

This is a Deutsche Bank process — assume German and EU regulation is in scope,
plus the international standards (Basel) that flow into it.

## Step 2 — Scan the regulatory landscape

Before the first write, clear the run manifest —
`python3 scripts/wiki/reset_manifest.py <slug>`. Every element you write is
logged to it; Step 3's report counts are read back from the manifest, not
tallied from memory.

Web-search for the regulation, supervisory rules and guidance that govern this
process. Work across the regulatory domains that bear on it — for a banking
process that typically means some of:

- **Prudential** — capital, liquidity, large exposures (CRR/CRD, Basel).
- **Financial crime** — sanctions, anti-money-laundering, KYC.
- **Conduct & consumer protection** — disclosure, fair treatment, complaints.
- **Operational risk & governance** — MaRisk, segregation of duties, outsourcing.
- **Data, records & reporting** — record-keeping, audit trail, regulatory
  reporting.

Search for **named** regulations and the supervisory body behind them (BaFin,
ECB, EBA, the EU institutions). Write one `regulation` element per material
obligation that genuinely applies to *this* process:

- Blocks: *What it requires* — the obligation it imposes on the process; *Why
  it applies* — why it is in scope for this process; *How it is met* — the
  controls and process steps that satisfy it, naming existing `control` ids
  where the mapping is clear, or noting that it is to be confirmed with the SME.
- Frontmatter: `domain:` the regulatory domain (e.g. "Financial Crime",
  "Operational Risk"); `source:` the regulation's name or the citing
  publication; `sourceUrl:` the page you drew it from. (`asOf:` is auto-stamped
  by `write_element.py` — leave it out.)
- Where a regulation is clearly satisfied by an existing control, set the
  `controls:` relation to that control's id.
- Write each with `next_id.py` → `write_element.py` (`status: draft`,
  `confidence: medium`; `low` if thinly evidenced) → `check_conformance.py`. If
  conformance flags an element, fix the draft and re-write before moving on.

Name **real** regulations and cite **real** sources — never invent a regulation
or a citation. If web search is unavailable, write only what you can solidly
support and say so in the report.

## Step 3 — Report

Run `python3 scripts/wiki/source_report.py <slug>` — it reads the run manifest
and prints how many elements were written, per type. Read the `regulation`
count from it; do not recount from memory.

Report with this **exact template**, substituting the counts:

> Regulatory scan complete for **{process}** from the web:
>
> - **Regulations:** {n} drafted
>
> Sources: {comma-separated list of the regulations / publications used}
>
> All are `status: draft` — review and approve them in the app, or run the
> control & compliance specialist to refine them and map them to controls.

If web search was unavailable, add one line saying so before the sources line.

## Scope

You source regulations, nothing else. You never document the process's controls,
control gaps or audit findings, never ask the SME anything, never run an
approval loop, never set `approved`. You never duplicate a regulation the wiki
already holds, never write anything you cannot ground in a real source, and
never invent a regulation.

<!-- WEB-PROVENANCE-BLOCK:start -->
## Provenance — web-sourced content is unconfirmed

This block is identical in the three `source-*` skills (HALLUCINATION-PLAN.md).
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

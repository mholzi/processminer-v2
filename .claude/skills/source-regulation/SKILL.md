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

**Get your element template up front.** Run
`python3 scripts/wiki/show_template.py regulation` — it prints, from
`schema/process-schema.json`, the `section`, the `idPrefix`, the frontmatter
(fields with their allowed values, the required keys, the relations) and the
`## ` blocks with their format and word range. That is the full contract — you
do **not** read the whole schema file. The scripts in `scripts/wiki/` own the
file format; you do the judgement.

## Step 1 — Read the process

Read `wiki/processes/<slug>/index.md` — what the process does, its industry,
its jurisdiction and its scope. Read the documented As-Is process: the
`process-steps`, `roles` and `exceptions`, so you know what activity is being
regulated. Read the existing `controls` — they tell you what risks the process
already manages, and let you map a regulation to the control that satisfies it.
Read any existing `regulation` elements: you extend, you never duplicate.

Use the process's `jurisdiction` field in `index.md` as the scope hint — the
regulation that governs the process's home jurisdiction, plus the international
standards (e.g. Basel for banking) that flow into it.

## Step 2 — Pick in-scope regulatory domains

Before the first write, clear the run manifest —
`python3 scripts/wiki/reset_manifest.py <slug>`. Every element you write is
logged to it; the report counts are read back from the manifest, not tallied
from memory.

Pick the regulatory domains that bear on *this* process — typically 3–5 of:

- **Prudential** — capital, liquidity, large exposures (CRR/CRD, Basel).
- **Financial Crime** — sanctions, anti-money-laundering, KYC.
- **Conduct & Consumer Protection** — disclosure, fair treatment, complaints.
- **Operational Risk & Governance** — MaRisk, segregation of duties, outsourcing.
- **Data, Records & Reporting** — record-keeping, audit trail, regulatory
  reporting.

Write the outline to `/tmp/<slug>-regulation-outline.json`:

    { "slug": "<slug>",
      "jurisdiction": "<jurisdiction from index.md>",
      "domains": ["Prudential", "Financial Crime", …] }

Skip a domain that plainly does not apply (e.g. *Conduct & Consumer Protection*
for a wholesale-only correspondent-banking process) and say so in the Step 5
report.

## Step 3 — Fan out per domain

The five domains are independent web-research streams, so scan them
**concurrently**: in a single message, dispatch **one sub-agent per in-scope
domain** with the Task tool and wait for all of them.

Give each sub-agent this brief, filling in its domain:

> You are sourcing the **{domain}** regulations that govern process `<slug>`
> (jurisdiction **{jurisdiction}**). Read
> `/tmp/<slug>-regulation-outline.json` for context, then
> `wiki/processes/<slug>/index.md`, the documented As-Is (`process-steps`,
> `roles`, `exceptions`) and the existing `controls` so you can map a
> regulation to the control that satisfies it. Read existing `regulation`
> elements so you do not duplicate one. Run `python3
> scripts/wiki/show_template.py regulation` for the element's shape.
> Web-search for **named** {domain} regulations, supervisory rules and
> guidance that apply to this process — name the supervisory body (BaFin,
> ECB, EBA, the EU institutions, etc.). Stay within **{domain}** only; the
> parent dispatched separate sub-agents for the other domains. Draft one
> `write_element.py` spec per material obligation: blocks *What it requires*
> / *Why it applies* / *How it is met* (name existing `control` ids where the
> mapping is clear, or note it is to be confirmed with the SME); frontmatter
> `domain: "{domain}"`, `source:`, `sourceUrl:`; `status: draft`,
> `confidence: medium` (`low` if thinly evidenced); a `provenance` map, one
> entry per block heading, every entry `{ "source": "web", "evidence": "<url>
> — \"<snippet>\" — fetched <date>" }`. Give each spec a `tempKey` prefixed
> with the domain slug (e.g. `"prudential-1"`, `"financial-crime-1"`) so keys
> never collide between domains. Name **real** regulations and cite **real**
> sources; never invent one. A handful of genuine obligations per domain,
> not a dump. You are **read-only** — do not write or run any write script.
> Return **only** a JSON array of the draft specs.

Collect the arrays and hold the drafts for the Step 4 batch write.

## Step 4 — Merge and write the batch

Concatenate every sub-agent's array into one manifest
`{ "slug": "<slug>", "elements": [ … ] }`, each spec omitting `id`. The
batch writer's dedup gate blocks `(regulation, lowercase name)` duplicates
across domains, but skim the merged list yourself and drop the obvious
overlap (a sub-agent in *Operational Risk* and one in *Data, Records &
Reporting* will both reach for outsourcing-record obligations) — a duplicate
caught here is one less correction in Step 5. Write
`/tmp/<slug>-regulations.json`, run `python3 scripts/wiki/write_elements.py
/tmp/<slug>-regulations.json`, then `python3
scripts/wiki/check_conformance.py <slug>`; fix any flagged element and
re-run.

Where a regulation is clearly satisfied by an existing control, record the
link on the **control**: patch that control's `regulatedBy` to add this
regulation's id (`patch_element.py --list`). A regulation has no `controls`
field — its control list is the derived reverse of `control.regulatedBy`.
Sequential is fine here — one patch per regulation-to-control link.

**Every regulation must be either mapped to a control or explicitly flagged
as having none.** Walk the merged manifest a second time after the control
patches: any `REG-*` that finished Step 4 with zero existing controls
referencing it back is a coverage gap an auditor lands on first. For each
such regulation, append a one-line note to the element's `How it is met`
block — verbatim shape: *"No control currently documented for this
obligation — coverage gap, to be addressed by the Control & Compliance
Specialist."* Use `patch_element.py --block "How it is met" …` so it
auto-flips that heading to `proposed` and the element becomes
non-approvable until a real control lands. This is the brake on the
"`status: draft`, link empty, looks fine in the list view" failure mode.

Name **real** regulations and cite **real** sources — never invent a regulation
or a citation. If web search is unavailable in a sub-agent's environment, tell
it to write only what it can solidly support and say so in the report.

## Step 5 — Report

Run `python3 scripts/wiki/source_report.py <slug>` — it reads the run manifest
and prints how many elements were written, per type. Read the `regulation`
count from it; do not recount from memory.

Report with the canonical template: run `python3 scripts/wiki/verbatim.py
source-regulation-report` and present what it prints, substituting the
counts. Reproduce every other character exactly; `verbatim.py` is the single
source of truth, never write the report from memory.

If web search was unavailable, add one line saying so before the sources line.

## Scope

You source regulations, nothing else. You never document the process's controls,
control gaps or audit findings, never ask the SME anything, never run an
approval loop, never set `approved`. You never duplicate a regulation the wiki
already holds, never write anything you cannot ground in a real source, and
never invent a regulation.

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

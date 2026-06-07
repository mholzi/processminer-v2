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

Take a `getProcessSummary({ slug })` snapshot once at the start for the overview,
counts and status, and work from it rather than re-reading the process repeatedly.

## What you produce

| Element | Section | What it captures |
|---|---|---|
| regulation | `regulation` | a regulatory obligation the process must satisfy |

You do **not** produce controls, control gaps or audit findings — those are the
`control-compliance-specialist`'s, drawn from the SME and the process itself,
not the web.


## Step 1 — Read the process

Read the process overview (root meta/content in the Document Map) — what the
process does, its industry, its jurisdiction and its scope. Read the documented
As-Is process: the `process-steps`, `roles` and `exceptions`
(`expandElement({ type })` to list a collection, then `expandElement({ type, id })`
for a specific element), so you know what activity is being regulated. Read the
existing `controls` — they tell you what risks the process already manages, and
let you map a regulation to the control that satisfies it. Read any existing
`regulation` elements: you extend, you never duplicate.

**Diff before you search.** Pull the existing `regulation` elements up front with
`getProcessElements({ slug, collection: "regulation" })` and build the set of
regulation names/citations already covered. When you plan each domain's searches
(Step 2), skip any obligation already in that set — decide what is *missing*
before searching, rather than discovering duplicates after drafting. Pull the
existing `controls` the same way (`getProcessElements({ slug, collection: "controls" })`)
so the reg→control mapping in Step 2 reads off real control ids.

Use the process's `jurisdiction` field in the process overview as the scope hint — the
regulation that governs the process's home jurisdiction, plus the international
standards (e.g. Basel for banking) that flow into it.

## Step 2 — Scan the regulatory landscape

Web-search for the regulation, supervisory rules and guidance that govern this
process. Work across the regulatory domains that bear on it — for a banking
process that typically means some of:

- **Prudential** — capital, liquidity, large exposures (CRR/CRD, Basel).
- **Financial crime** — sanctions, anti-money-laundering, KYC.
- **Conduct & consumer protection** — disclosure, fair treatment, complaints.
- **Operational risk & governance** — MaRisk, segregation of duties, outsourcing.
- **Data, records & reporting** — record-keeping, audit trail, regulatory
  reporting.

**Fan the domains out to parallel sub-agents.** The domains are independent web
streams, so dispatch one concurrent read-only sub-agent per domain — prudential,
financial-crime/AML, conduct, op-risk, data/reporting — **in a single message**
(the parallel pattern `source-cx` uses for its tiers). Each sub-agent searches
its own domain and returns draft `regulation` specs; you merge the returned
drafts into one candidate set before writing. Running the domains in parallel
rather than serially is the dominant wall-clock win for this IO-bound skill.

**Use authored query templates, not improvised terms.** Drive each domain's
search from a fixed search-string template keyed off the overview's
`jurisdiction` and process domain, so the same process yields the same searches
every run. For example:

- Prudential — `"{jurisdiction} {process-domain} capital liquidity requirements CRR CRD Basel"`
- Financial crime / AML — `"{jurisdiction} AML KYC sanctions obligations {process-domain}"`
- Conduct — `"{jurisdiction} {process-domain} conduct consumer protection disclosure rules"`
- Operational risk — `"{jurisdiction} {process-domain} operational risk outsourcing MaRisk governance"`
- Data & reporting — `"{jurisdiction} {process-domain} record-keeping audit trail regulatory reporting"`

Substitute the actual jurisdiction and process domain; do not improvise term
wording per run.

**Dedup and cap before drafting.** Merge the sub-agents' candidates, dedup by
normalised regulation name/citation (and drop any already covered per the Step 1
diff), then cap to at most **N obligations per domain** (default N = 5, the
highest-materiality first) before you draft. Two runs over the same landscape
then converge on the same set instead of a variable-length dump.

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
  by the createElement({ type, element }) tool — leave it out.)
- Emit each regulation as the **full structured spec object** —
  `{ domain, source, sourceUrl, blocks, provenance }` — with every required block
  and a `provenance` entry per heading filled in before you write. `createElement`
  already validates each element against the schema and rejects malformed ones, so
  a complete object up front avoids the conformance fix-and-retry round.
- Where a regulation is clearly satisfied by an existing control, record the
  link on the **control**: patch that control's `regulatedBy` to add this
  regulation's id (use the updateElement({ id, patch }) tool). A regulation has no `controls`
  field — its control list is the derived reverse of `control.regulatedBy`.
  **Auto-derive the link** rather than judging each mapping by eye: read the
  existing controls (`getProcessElements({ slug, collection: "controls" })`, plus
  `getProcessRelations({ slug })` whose `orphans.regulations` flags regulations with
  no control point) and, where a control's domain/scope clearly satisfies the
  regulation, set that control's `regulatedBy` from those existing controls.
- Write regulations **incrementally, one `createElements({ elements })` call per
  domain** — collect a domain sub-agent's deduped, capped drafts into a single
  call (each `{ type: "regulation", element: { … } }`, `status: draft`,
  `confidence: medium`; `low` if thinly evidenced) rather than per-regulation or
  one end-of-run batch. Batching by domain cuts write round-trips while still
  surfacing each domain's regulations in the workspace as the scan proceeds,
  keeping the session visibly alive. Keep a **running total** of the per-type
  `counts` each call returns. After the last domain, run the checkConformance()
  tool once; fix any flagged element and re-run it. Each call also returns
  `created` (the assigned ids).

Name **real** regulations and cite **real** sources — never invent a regulation
or a citation. If web search is unavailable, write only what you can solidly
support and say so in the report.

## Step 3 — Report

Read the `regulation` count from your **running total** (the `regulation` counts
summed across every createElements call); do not recount from memory.

Report with the canonical template:
"""
Regulatory scan complete for **{process}** from the web:

- **Regulations:** {n} drafted

Sources: {comma-separated list of the regulations / publications used}

All are `status: draft` — review and approve them in the app, or run the control & compliance specialist to refine them and map them to controls.
"""
and present what it prints, substituting the
counts. Reproduce every other character exactly; the verbatim text is the single
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

This block is identical in the three web-sourcing skills — keep them in sync by
hand if you change one. The provenance contract is in `CORE_SYSTEM_PROMPT.md`.

You source from the web with no SME present. Every element you write is
therefore **unconfirmed** until a specialist refines it with the SME. Record
that honestly in the `provenance` map of the createElement({ type, element }) tool spec — one
entry per block heading, every entry `source: web`:

    "provenance": {
      "The trend":  { "source": "web",
                      "evidence": "<url> — \"<verbatim snippet>\" — fetched <YYYY-MM-DD>" },
      "Relevance":  { "source": "web", "evidence": "<url> — \"...\" — fetched <YYYY-MM-DD>" },
      "Evidence":   { "source": "web", "evidence": "<url> — \"...\" — fetched <YYYY-MM-DD>" }
    }

`evidence` is the page URL, the verbatim snippet you drew the claim from, and
the date you fetched it — a web page mutates, so the snippet is the durable
record. A `web` heading carries no SME confirmation, so use the setApproval() tool
**blocks approval** of the element until the owning specialist walks it through
the SME, at which point each confirmed heading flips to `elicited`. Do not try
to approve a web-sourced element yourself.
<!-- WEB-PROVENANCE-BLOCK:end -->
---
name: source-target
description: >-
  Autonomously consolidate everything documented about a process — the As-Is,
  the risk & compliance picture, the client experience, the innovation work and
  the systems landscape — into a first-stub Target Process: draft target-state,
  transformation-decision and gap elements. Non-interactive: no SME questions,
  no approval loop. Invoked by a button or another skill. Use this whenever the
  user wants to auto-draft, pre-fill or stub the target state, the to-be design
  or the transformation of a process from the work already done.
---

# Source Target

You autonomously draft a process's **first-stub Target Process** by
consolidating everything the wiki already documents — the As-Is, the risk &
compliance picture, the client experience, the innovation work and the systems
landscape — into draft `target-state`, `transformation-decision` and `gap`
elements. You are invoked with a process `<slug>`, by a UI button or another
skill.

This is the internal-consolidation analogue of `source-innovation`: that skill
sources the innovation perspective from the *web*; you synthesise the *target*
perspective from the wiki the five perspective specialists have already built.
The deep, interactive forward-synthesis work — refining the stub with the SME,
weighing each decision, naming the real gaps — is the **`transformation-agent`**
specialist's; you only do the fast first-stub pass it starts from.

**You are non-interactive.** No SME is present. You ask nothing, you run no
approval loop — you read, consolidate, draft, write, and report. Everything you
write is `status: draft` with `confidence: low` and every block marked
`proposed`; the `transformation-agent` walks it through the SME, and the SME
approves it in the app.

## What you produce

| Element | Section | What it captures |
|---|---|---|
| target-state | `to-be-design` | how the process should work in the future |
| transformation-decision | `transformation-decisions` | a decision taken to reach the target state |
| gap | `gap-resolution` | a gap between As-Is and target, and how to close it |
| requirement | `requirements` | a testable statement of what the target must do |
| process-dependency | `dependencies` | an upstream feeder or downstream consumer the target connects to |
| assumption | `assumptions` | something the target rests on that still needs confirming |

The first three are the heart of the consolidation. The last three are
**section seeds** — at least one low-confidence stub per section so the
Target Process area is not left structurally empty after the consolidation
pass (the `transformation-agent` walks each one to elicited content with the
SME). Derive them mechanically from what you have already drafted:

- Each **transformation-decision** that prescribes a system, data flow or
  behaviour change yields one or more **requirements** (e.g. TD "deploy an
  intake validator agent" → REQ "the intake validator agent must flag the
  same required fields as the manual check, with a false-positive rate
  measured during shadow run"). Aim for at least one requirement per
  transformation-decision; group when the decisions are tightly related.
- Read each `system` and `integration` for upstream/downstream relations
  (where does the input come from, where does the output go), and draft one
  **process-dependency** per external feeder or consumer named in the wiki.
  At least two dependencies.
- Every transformation-decision implicitly rests on assumptions — pricing
  unchanged, regulatory stance steady, vendor availability, etc. Draft at
  least two **assumptions**: the most load-bearing one per transformation-
  decision cluster.

The `validation` section has no formal element type and is the
transformation-agent's territory — you write nothing there. You also do
**not** produce As-Is elements, controls, CX elements, market trends,
innovation ideas, innovation risks or systems — those belong to the five
perspective specialists. You only consolidate what they wrote into a target.


## Step 1 — Read the whole process

Read the process overview (root meta/content in the Document Map — the domain,
what the process does, its scope), then read **every perspective**
(`expandElement({ type })` to list a collection, then `expandElement({ type, id })`
for a specific element), because the target consolidates all of them:

- **As-Is** — `process-step`, `exception`, `pain-point`, `process-gap`,
  `role`, `metric`. The pain-points and process-gaps are the problems the
  target must resolve; the steps are what a `target-state` `replaces`.
- **Risk & Compliance** — `control`, `regulation`, `compliance-gap`,
  `audit-finding`. A compliance-gap or audit-finding is as real a target driver
  as a pain-point — the transformation must close it without weakening a
  control.
- **Client Experience** — `friction-point`, `cx-touchpoint`, `moment`,
  `cx-benchmark`. Client-facing friction is a problem the target should relieve.
- **Innovation** — `market-trend`, the competitor moves, `innovation-idea`,
  `innovation-risk`. The **innovation-ideas are the raw material of the target
  state** — a target-state theme is the ideas the process should pursue, made
  concrete. Innovation-risks are honest counterweights.
- **IT Architecture** — `system`, `integration`. The target can only assume
  capabilities the systems landscape can plausibly support.

Also read any existing `target-state`, `transformation-decision` or `gap`
elements: you **extend, you never duplicate** an element the wiki already
holds. If the Target Process area is already populated, draft only what is
genuinely missing.

If the process has little documented yet — no innovation ideas, few
pain-points — draft conservatively from what exists and say so in the Step 5
report. Never invent problems or ideas to pad the target; a thin process
yields a thin first stub, and that is honest.

## Step 2 — Draft the target states

A `target-state` is a **theme of how the process should work in the future** —
not a restatement of one idea, but a coherent future picture that a cluster of
innovation-ideas, addressing a cluster of related problems, points to. Group
the innovation-ideas by the part of the process they reshape; each genuine
cluster is one `target-state`.

Draft each as a `createElement` spec (`status: draft`, `confidence: low` —
consolidated, not yet SME-validated). Capture `replaces` — the As-Is
`process-step` ids the theme touches; it drives the As-Is↔To-Be overlay in the
app. Give each target-state a `tempKey` (e.g. `"ts-1"`) so a decision or gap
can reference it. Hold the drafts — the whole Target Process is written in one
batch at the end of Step 4.

Aim for the handful of themes that genuinely structure the future process — not
one target-state per idea.

## Step 3 — Draft the transformation decisions

A `transformation-decision` is a **decision the bank must take to reach the
target** — adopt a platform, automate a control, re-sequence a hand-off, retire
a channel. Derive them from the target-states and the problems: every target
implies decisions, and every open As-Is problem needs a decision that resolves
it.

For each decision capture two relations:
- `resolves` — the As-Is problems it resolves: `pain-point`, `process-gap`,
  `compliance-gap`, `friction-point`, `audit-finding`. Walk **every** open
  problem across all perspectives and make sure at least one decision resolves
  it — an uncovered problem is either a real gap (Step 4) or a missing decision.
- `realises` — the `target-state` themes it brings about, each as
  `"@<tempKey>"` from Step 2 (optional; a governance or sequencing decision
  may realise none).

Draft each decision as a `createElement` spec (`status: draft`,
`confidence: low`) and give it a `tempKey`. Hold the drafts for the Step 4
batch write.

## Step 4 — Draft the gaps

A `gap` is **what stands between the As-Is and the target, and how to close
it** — a capability the bank does not yet have, a dependency, a sequencing
constraint. After Step 3, any open As-Is problem that no decision resolves, and
any `target-state` a decision does not realise, is a candidate gap. So is any
`innovation-risk` that the transformation must actively manage.

Draft each `gap` per its template, linking the `target-state` it serves by its
`"@<tempKey>"` from Step 2.

## Step 4.5 — Section seeds (requirements, dependencies, assumptions)

Before writing the batch, draft the section seeds described in
"What you produce" so the Requirements, Dependencies and Assumptions sections
are not left structurally empty:

- **requirement** — for each `transformation-decision`, draft at least one
  `requirement` (template type `requirement`, section `requirements`) that
  states what the target must do for the decision to be true. Link it to its
  parent decision by `"@<tempKey>"`.
- **process-dependency** — read each `system` and `integration` for the
  upstream and downstream parties named, and draft one `process-dependency`
  (template type `process-dependency`, section `dependencies`) per external
  feeder or consumer. Aim for at least two.
- **assumption** — draft at least two `assumption` elements (template type
  `assumption`, section `assumptions`) naming the most load-bearing
  assumptions behind the transformation-decision cluster.

Every section-seed element is `status: draft`, `confidence: low`, with every
block marked `proposed` — same convention as the target-states themselves.
The `transformation-agent` walks each one to elicited content.

Then write the **whole Target Process in one batch** — assemble a manifest
`{ "slug": "<slug>", "elements": [ … ] }` of every target-state,
transformation-decision, gap, requirement, process-dependency and assumption,
each spec omitting `id`, each carrying its `tempKey`, every `realises`,
target-state link and decision link written as `"@<tempKey>"` — and use the createElements({ elements }) tool, then
use the checkConformance({ slug }) tool. The batch writer assigns
every id and resolves every `@<tempKey>`, and returns `created` (the ids) plus
per-type `counts`.

## Step 5 — Report

Read the per-type `counts` the createElements call returned. Do not recount from memory.

Report with the canonical template:
"""
Source Target stubbing complete for **{process}** by consolidating the documented work:

- **Target states:** {n} drafted — each linked to the As-Is steps it replaces
- **Transformation decisions:** {n} drafted — each linked to the problems it resolves
- **Gaps:** {n} drafted

Consolidated from: {n} pain/process gaps, {n} compliance gaps / audit findings, {n} friction points, {n} innovation ideas.

All are `status: draft`, `confidence: low` — a first stub. Run the **transformation-agent** to refine it with the SME, then approve in the app.
"""
and present what it prints, substituting the counts.
Reproduce every other character exactly; the verbatim template is the single source
of truth, never write the report from memory.

If a perspective was empty (no innovation ideas, no documented As-Is), add one
line saying so before the consolidated-from line.

## Scope

You draft target-states, transformation-decisions and gaps, nothing else. You
never ask the SME anything, never run an approval loop, never set `approved`.
You never duplicate an element the wiki already holds. You never create or
edit As-Is, risk, CX, innovation or IT elements — you only read them. You never
invent a problem, an idea or a capability the wiki does not document.

## Provenance — a consolidated stub is unconfirmed

You synthesise the target from the wiki with no SME present. Every element you
write is therefore a **proposal the SME has not confirmed** — you grouped the
ideas, you named the decisions, you judged the gaps. Record that honestly in
the `provenance` map of the `createElement` spec — one entry per block
heading, every entry `source: proposed`, `evidence: ""`:

    "provenance": {
      "The target":    { "source": "proposed", "evidence": "" },
      "Why it matters": { "source": "proposed", "evidence": "" }
    }

`proposed` is the honest default — it tells the SME and the app exactly which
content still needs confirming. A `proposed` heading **cannot be approved** —
the system blocks it. The `transformation-agent` walks each element
through the SME and flips every confirmed heading to `elicited`. Do not mark a
heading `elicited` yourself — no SME spoke to you — and do not try to approve a
consolidated element.
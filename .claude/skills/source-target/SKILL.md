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

You do **not** produce As-Is elements, controls, CX elements, market trends,
innovation ideas, innovation risks or systems — those belong to the five
perspective specialists. You only consolidate what they wrote into a target.

## The wiki you write into

**Get your element templates up front.** Run
`python3 scripts/wiki/show_template.py <type> …`, passing the `type` of every
element you draft (the types listed under "What you produce"). For each it
prints — from `schema/process-schema.json` — the `section`, the `idPrefix`, the
frontmatter (fields with their allowed values, the required keys, the
relations) and the `## ` blocks with their format and word range. That is the
full contract — you do **not** read the whole schema file. The scripts in
`scripts/wiki/` own the file format; you do the judgement.

## Step 1 — Read the whole process

Read `wiki/processes/<slug>/index.md` (the domain — what the process does, its
scope), then read **every perspective**, because the target consolidates all of
them:

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

Before the first write, clear the run manifest —
`python3 scripts/wiki/reset_manifest.py <slug>`. Every element you write is
logged to it; Step 5's report counts are read back from the manifest, not
tallied from memory.

A `target-state` is a **theme of how the process should work in the future** —
not a restatement of one idea, but a coherent future picture that a cluster of
innovation-ideas, addressing a cluster of related problems, points to. Group
the innovation-ideas by the part of the process they reshape; each genuine
cluster is one `target-state`.

Draft each as a `write_element.py` spec (`status: draft`, `confidence: low` —
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

Draft each decision as a `write_element.py` spec (`status: draft`,
`confidence: low`) and give it a `tempKey`. Hold the drafts for the Step 4
batch write.

## Step 4 — Draft the gaps

A `gap` is **what stands between the As-Is and the target, and how to close
it** — a capability the bank does not yet have, a dependency, a sequencing
constraint. After Step 3, any open As-Is problem that no decision resolves, and
any `target-state` a decision does not realise, is a candidate gap. So is any
`innovation-risk` that the transformation must actively manage.

Draft each `gap` per its template, linking the `target-state` it serves by its
`"@<tempKey>"` from Step 2. Then write the **whole Target Process in one
batch** — assemble a manifest `{ "slug": "<slug>", "elements": [ … ] }` of
every target-state, transformation-decision and gap, each spec omitting `id`,
each carrying its `tempKey`, every `realises` and target-state link written as
`"@<tempKey>"` — and run `python3 scripts/wiki/write_elements.py
/tmp/<slug>-elements.json`, then `python3 scripts/wiki/check_conformance.py
<slug>`. The batch writer assigns every id and resolves every `@<tempKey>`.

## Step 5 — Report

Run `python3 scripts/wiki/source_report.py <slug>` — it reads the run manifest
and prints how many elements were written, per type. Do not recount from memory.

Report with the canonical template: run `python3 scripts/wiki/verbatim.py
source-target-report` and present what it prints, substituting the counts.
Reproduce every other character exactly; `verbatim.py` is the single source
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
the `provenance` map of the `write_element.py` spec — one entry per block
heading, every entry `source: proposed`, `evidence: ""`:

    "provenance": {
      "The target":    { "source": "proposed", "evidence": "" },
      "Why it matters": { "source": "proposed", "evidence": "" }
    }

`proposed` is the honest default — it tells the SME and the app exactly which
content still needs confirming. A `proposed` heading **cannot be approved** —
`set_approval.py` blocks it. The `transformation-agent` walks each element
through the SME and flips every confirmed heading to `elicited`. Do not mark a
heading `elicited` yourself — no SME spoke to you — and do not try to approve a
consolidated element.

---
name: run-lint
description: >-
  Run a lint pass over a process wiki — the consistency checkpoint. Check
  every element against its schema template, then sweep the whole process
  from all five perspectives for cross-section discrepancies and clarifying
  questions. Write the findings to lint.json for the app's Review panel and
  re-open any approved element a finding implicates. Use this whenever the
  user asks to lint, run a lint pass, check the wiki for consistency, or
  review a process for issues.
---

# Run Lint

You run the lint pass over one process: the consistency checkpoint that keeps
the wiki's "approved" set honest. You do the judgement — the cross-perspective
sweep — and the native tools do the mechanics. **Use the fixed wording below
verbatim**, so every run reads the same to the user.

You are invoked with a process `<slug>`. Lint covers that one process only.

## Step 1 — Load the process

Take the process title from `wiki/processes/<slug>/index.md`. You orchestrate
the lint pass — the deterministic tools (Step 2) and the per-lens sub-agents
(Step 3) each read the elements they need, so you do not have to read every
element yourself.

## Step 2 — Deterministic checks

Use the `checkConformance({ slug })` tool. It compares
every element against its element type's schema template **and its required
frontmatter**, and returns a **JSON array of conformance findings** — one
object per non-conforming element, each already shaped
`{kind: "conformance", title, detail, elements}`.

Then use the `checkTransitions({ slug })` tool. It checks
exception wiring — the single source of truth is each process-step's
`transitions`. It returns a **JSON array of `discrepancy` findings**: one per
orphan exception (no process-step `transitions` into it) and one per
process-step transition pointing at an exception id that does not exist.

Keep both arrays exactly as returned. You do not author, reshape or re-type
these findings — they are fully deterministic; a clean process returns `[]`.
Together they are the deterministic half of Step 4's input.

## Step 3 — Cross-perspective sweep (five parallel lenses)

The council sweeps the whole process from all five perspectives. The lenses
are independent, so run them **concurrently**: in a single message, dispatch
**five sub-agents** with the Task tool — one per lens — and wait for all five.

Give each sub-agent this brief, with `{Lens}` and `{what to check}` filled
from the table below:

> You are the **{Lens}** lens of a lint pass on process `<slug>`. Read every
> element under `wiki/processes/<slug>/`. Looking only through your lens,
> check: {what to check}. The council looks at every element, including ones
> it has no relation to — "a step with no control" is found by looking at
> steps that link to nothing. Record a finding for every real issue: use
> `kind: "discrepancy"` when two elements disagree or a link is missing,
> `kind: "question"` when the wiki is ambiguous and only the SME can resolve
> it. Each finding is `{ "kind", "title", "detail", "elements" }` — `detail`
> explains it concretely, `elements` lists the **actual element ids**
> involved. Be specific and conservative: only a finding you can point to in
> the elements; never invent one to pad. You are **read-only** — do not write,
> edit or run any script. Return **only** a JSON array of your findings, `[]`
> if none.

| Lens | What to check across the process |
|---|---|
| **Process** | a process-step with no control linked; a step with no SLA where a touchpoint sets a client expectation; a missing or contradictory RACI entry; an exception with no scope or no fallback procedure |
| **Control & Compliance** | a compliance-gap on a topic that has no control; a control linked to no step; segregation-of-duties not covered by any control |
| **Client Journey** | a friction-point and a pain-point describing the same issue but not linked; an innovation or friction item not traced to the pain-point it addresses |
| **Innovation** | an innovation-idea not linked to the friction- or pain-point it solves; a pain-point with no innovation-idea addressing it |
| **IT Architect** | a count stated in prose that disagrees with the documented elements (e.g. "6+ systems" vs 8 systems); an integration referencing no system; a system touched by no step |

The sub-agents are read-only and each reads the wiki itself — that is what
lets them run in parallel. Only you write, in Step 4.

**Confirm coverage.** When all five return you hold five findings arrays —
one per lens, even when a lens found nothing. State one coverage line naming
all five, e.g. `Swept: Process · Control & Compliance · Client Journey ·
Innovation · IT Architecture`, so a thorough run is visibly distinct from one
that skipped a lens.

## Step 4 — Apply (deterministic)

Assemble the full findings array: the conformance array and the
transitions-reconciliation array from Step 2 — **both kept exactly as the
tools returned them** — followed by the discrepancy and question findings
from the five lens sub-agents in Step 3 (concatenate their five arrays). Each
finding is an object:

```json
{ "kind": "discrepancy", "title": "...", "detail": "...", "elements": ["PS-COB-004", "CP-COB-004"] }
```

Then use the `applyLint({ slug, findings })` tool.

This tool assigns finding ids, writes `wiki/processes/<slug>/lint.json` (the
file the app's Review panel reads), and re-opens every approved element a
finding implicates — setting it back to `in-progress`, stamped `run-lint`.
**Always run it, even when you found nothing** — an empty pass writes an
all-clear `lint.json`. Relay any warning it prints about unknown element ids.

## Step 5 — Summarise

Report with the canonical template. If there were findings, present the following, substituting the process title and the counts from `applyLint`'s output:
```
Lint pass complete — **{process}**:

- **Discrepancies:** {n}
- **Structure issues:** {n}
- **Clarifying questions:** {n}
- **Approvals re-opened:** {n}

The findings are in the Review panel — click any element ID to jump to it.
```

If there were no findings at all, use the clean variant instead, presenting the following and substituting `{process}`:
```
Lint pass complete — **{process}**: no findings. Every element conforms to its template and the wiki is consistent across all five perspectives.
```

## Scope

You lint one process and report. You never resolve a finding, never edit an
element's content, and never change an element's approval yourself — re-opening
approvals is `applyLint`'s deterministic job. The SME resolves findings in
the app.

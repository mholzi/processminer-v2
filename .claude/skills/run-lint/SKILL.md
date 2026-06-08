---
name: run-lint
description: >-
  Run a lint pass over a process wiki — the consistency checkpoint. Check
  every element against its schema template, then sweep the whole process
  from all five perspectives for cross-section discrepancies and clarifying
  questions. Write the findings to the runtime store for the app's Review panel and
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

Use `expandElement({ type })` for every collection to read all elements into
your working context, then `expandElement({ type, id })` for any bodies you
need in full. Take the process title from the root `meta`/`content`. You must
read every element yourself — do not delegate this to sub-agents.

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

## Step 3 — Cross-perspective sweep (five lenses, in-context)

Using the elements you loaded in Step 1, sweep the process through each of the
five lenses below **sequentially in this session** — no sub-agents, no Task
tool. Accumulate all findings into a single array as you go.

For each lens, look across every element (including elements with no
relations — "a step with no control" is found by looking at steps that link to
nothing). Record a finding for every real issue:
- `kind: "discrepancy"` — two elements disagree or a required link is missing
- `kind: "question"` — wiki is ambiguous; only the SME can resolve it

Each finding: `{ "kind", "title", "detail", "elements" }` — `detail` is
concrete, `elements` lists the actual element ids involved. Be conservative:
only record what you can point to; never pad.

| Lens | What to check across the process |
|---|---|
| **Process** | a process-step with no control linked; a step with no SLA where a touchpoint sets a client expectation; a missing or contradictory RACI entry; an exception with no scope or no fallback procedure |
| **Control & Compliance** | a compliance-gap on a topic that has no control; a control linked to no step; segregation-of-duties not covered by any control; a control whose `owner` is a coarse function ("Operations", "Compliance") where a more precise documented role element exists — name both the control and the role it should point to |
| **Client Journey** | a friction-point and a pain-point describing the same issue but not linked; an innovation or friction item not traced to the pain-point it addresses |
| **Innovation** | an innovation-idea not linked to the friction- or pain-point it solves; a pain-point with no innovation-idea addressing it |
| **IT Architect** | a count stated in prose that disagrees with the documented elements (e.g. "6+ systems" vs 8 systems); an integration referencing no system; a system touched by no step |

Once done, state one coverage line naming all five lenses swept, e.g.
`Swept: Process · Control & Compliance · Client Journey · Innovation · IT Architecture`.

## Step 4 — Apply (deterministic)

Assemble the full findings array: the conformance array and the
transitions-reconciliation array from Step 2 — **both kept exactly as the
tools returned them** — followed by the discrepancy and question findings from
the five lenses in Step 3 (concatenate all). Each finding is an object:

```json
{ "kind": "discrepancy", "title": "...", "detail": "...", "elements": ["PS-COB-004", "CP-COB-004"] }
```

**You must call `applyLint({ slug, findings })` before reporting — no
exceptions.** This is the only step that writes findings to the runtime store
(`data/runtime/<slug>.json`) where the Review panel reads them. Generating a
summary in chat without calling this tool means findings are lost on reload.
Always call it even when `findings` is `[]` — an empty pass writes an
all-clear report. Relay any warning the tool returns about unknown element ids.

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

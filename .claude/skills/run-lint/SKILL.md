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
sweep — and the Python scripts do the mechanics. **Use the fixed wording below
verbatim**, so every run reads the same to the user.

You are invoked with a process `<slug>`. Lint covers that one process only.

## Step 1 — Load the process

Take the process title from `wiki/processes/<slug>/index.md`. Read every
element under `wiki/processes/<slug>/` so you have the whole process in view —
all sections, all element types.

## Step 2 — Deterministic checks

Run `python3 scripts/wiki/check_conformance.py <slug> --json`. It compares
every element against its element type's schema template **and its required
frontmatter**, and prints a **JSON array of conformance findings** — one
object per non-conforming element, each already shaped
`{kind: "conformance", title, detail, elements}`.

Then run `python3 scripts/wiki/check_transitions.py <slug> --json`. It
reconciles each exception's `affects` against the process-steps whose
`transitions` flow into it, and prints a **JSON array of `discrepancy`
findings** — one per exception where the two disagree.

Keep both arrays exactly as printed. You do not author, reshape or re-type
these findings — they are fully deterministic; a clean process prints `[]`.
Together they are the deterministic half of Step 4's input.

## Step 3 — Cross-perspective sweep (judgement)

Sweep the whole process from all five perspectives. This is the council: each
lens looks at every element, including elements it has no relation to — "a step
with no control" is found by *looking at steps that link to nothing*. Record a
finding for every real issue.

Use `kind: discrepancy` when two elements disagree or a link is missing; use
`kind: question` when the wiki is ambiguous or under-specified and only the SME
can resolve it. Every finding needs a `title`, a `detail` that explains it
concretely, and an `elements` list of the **actual element ids** involved.

| Lens | What to check across the process |
|---|---|
| **Process** | a process-step with no control linked; a step with no SLA where a touchpoint sets a client expectation; a missing or contradictory RACI entry; an exception with no scope or no fallback procedure |
| **Control & Compliance** | a compliance-gap on a topic that has no control; a control linked to no step; segregation-of-duties not covered by any control |
| **Client Journey** | a friction-point and a pain-point describing the same issue but not linked; an innovation or friction item not traced to the pain-point it addresses |
| **Innovation** | an innovation-idea not linked to the friction- or pain-point it solves; a pain-point with no innovation-idea addressing it |
| **IT Architect** | a count stated in prose that disagrees with the documented elements (e.g. "6+ systems" vs 8 systems); an integration referencing no system; a system touched by no step |

Be specific and conservative: only record a finding you can point to in the
elements. Do not invent issues to pad the list.

**Confirm coverage.** Every run sweeps all five lenses, even when a lens
yields nothing. After the sweep, state one coverage line naming all five —
e.g. `Swept: Process · Control & Compliance · Client Journey · Innovation ·
IT Architecture` — so a thorough run is visibly distinct from one that
skipped a lens.

## Step 4 — Apply (deterministic)

Assemble the full findings array: the conformance array and the
transitions-reconciliation array from Step 2 — **both kept exactly as the
scripts printed them** — followed by the discrepancy and question findings you
wrote in Step 3. Each finding is an object:

```json
{ "kind": "discrepancy", "title": "...", "detail": "...", "elements": ["PS-COB-004", "CP-COB-004"] }
```

Write the array to `/tmp/run-lint-<slug>.json`, then run:

```
python3 scripts/wiki/apply_lint.py <slug> /tmp/run-lint-<slug>.json
```

The script assigns finding ids, writes `wiki/processes/<slug>/lint.json` (the
file the app's Review panel reads), and re-opens every approved element a
finding implicates — setting it back to `in-progress`, stamped `run-lint`.
**Always run it, even when you found nothing** — an empty pass writes an
all-clear `lint.json`. Relay any warning it prints about unknown element ids.

## Step 5 — Summarise

Report with this **exact template**, substituting the process title and the
counts from `apply_lint.py`'s output:

> Lint pass complete — **{process}**:
>
> - **Discrepancies:** {n}
> - **Structure issues:** {n}
> - **Clarifying questions:** {n}
> - **Approvals re-opened:** {n}
>
> The findings are in the Review panel — click any element ID to jump to it.

If there were no findings at all, replace the body with exactly:

> Lint pass complete — **{process}**: no findings. Every element conforms to
> its template and the wiki is consistent across all five perspectives.

## Scope

You lint one process and report. You never resolve a finding, never edit an
element's content, and never change an element's approval yourself — re-opening
approvals is `apply_lint.py`'s deterministic job. The SME resolves findings in
the app.

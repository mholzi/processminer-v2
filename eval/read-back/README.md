# Read-back eval

Scoped eval for the hallucination countermeasure (HALLUCINATION-PLAN.md T10/D9).

The countermeasure turns on one behaviour: when a skill inflates a thin SME
comment into a fuller element, it must **read back** what it added — name every
fact the SME did not give it — before the SME approves. That behaviour lives in
prompt text across six skills (the `PROVENANCE-BLOCK`). Prompt text drifts and
cannot be unit-tested; this eval is how the behaviour stays verifiable.

## What it checks

`fixtures.json` holds one case per skill perspective. Each case has:

- `smeInput` — the thin thing the SME said
- `aiDraft` — the inflated element the AI produced
- `additions` — the facts the AI added beyond `smeInput`
- `goodReadback` — an honest read-back that names every addition
- `badReadback` — a rubber-stamp that names none

`grade.py` scores a read-back: what fraction of the `additions` it discloses.
`run.py` asserts the grader passes every `goodReadback` and fails every
`badReadback` — catching a grader gone too loose (passes a rubber-stamp) or too
strict (fails an honest read-back).

## Run it

```
python3 eval/read-back/run.py        # or: npm run eval:read-back
```

Exit 0 when the eval is sound, 1 otherwise.

## Evaluating a real skill run

`run.py` today covers the grader and fixtures. To grade an actual skill, capture
the read-back text the skill produced for a case and call the grader:

```python
from grade import grade_readback
result = grade_readback(skill_output_text, case["additions"])
# result["score"] >= fixtures.json passThreshold  → the skill read back honestly
```

Wire that into a skill-transcript harness when one exists (it depends on
capturing headless `claude` CLI output — see the F6.1 eval-suite TODO).

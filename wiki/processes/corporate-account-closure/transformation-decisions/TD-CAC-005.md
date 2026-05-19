---
id: TD-CAC-005
type: transformation-decision
section: transformation-decisions
title: Codify the callback threshold as EUR-equivalent and automate FX normalisation at disbursement
status: draft
confidence: medium
source: M. Berger; source-target synthesis — corporate-account-closure wiki
decisionType: policy-and-automation
decisionStatus: proposed
resolves: [PG-CAC-001]
realises: [TS-CAC-004]
fromIdea: [II-CAC-001]
provenance: {"Options considered": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "Rationale": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "The decision": {"evidence": "", "source": "proposed"}}
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-19
---
## The decision
Define the EUR 100,000 callback threshold as a fixed EUR-equivalent amount in policy, and configure the Payments Platform to apply a real-time FX conversion rate at the point of disbursement, triggering the callback check consistently regardless of the disbursement currency.

## Options considered
- Define as EUR-equivalent with automated FX check in the Payments Platform
- Define separate per-currency nominal thresholds
- Raise the threshold to a level that eliminates cross-currency ambiguity risk
- Leave the threshold as-is and accept currency-basis inconsistency

## Rationale
The EUR-equivalent option is the most operationally consistent and requires only a policy decision and a Payments Platform configuration change. Per-currency thresholds require ongoing maintenance as product currency coverage changes. Leaving the threshold ambiguous maintains the control gap in CP-CAC-004.

---
id: TD-DDMM-009
type: transformation-decision
section: transformation-decisions
title: Define Mandate Retention Period and CI-Deactivation Review Procedure
status: draft
confidence: high
source: ddmm-transformation-agent
decisionType: GOVERNANCE
decisionStatus: DECIDED
resolves: [CG-DDMM-001, PG-DDMM-002, PG-DDMM-003]
realises: [TS-DDMM-007]
fromIdea: []
provenance: {"Options considered": {"evidence": "SME confirmed options and rationale — accepted without edit.", "source": "elicited"}, "Rationale": {"evidence": "SME confirmed rationale — accepted without edit.", "source": "elicited"}, "The decision": {"evidence": "SME (M. Vogel) accepted all ten decisions without edit.", "source": "elicited"}}
---
## The decision
Define a formal mandate data retention period (active lifetime plus statutory minimum post-cancellation) with Legal/DPO approval; align CP-DDMM-005 dormancy threshold to the same value; implement automated purge and a CI-deactivation mandate review procedure in MMS.

## Options considered
- Continue without defined retention period, address case-by-case (GDPR non-compliant — current state)
- Define retention period, align dormancy threshold, implement purge and CI-deactivation review (chosen)
- Define retention period only, without addressing dormancy or CI-deactivation (partial — PG-DDMM-002 and PG-DDMM-003 remain open)

## Rationale
A retention period without an aligned dormancy threshold leaves CP-DDMM-005 unauditable; omitting the CI-deactivation procedure leaves an undocumented process with live compliance risk. All three gaps share a root cause and are closed by the same governance decision — defining the threshold and the event-triggered review together.

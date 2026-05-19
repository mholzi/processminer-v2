---
id: TD-CAC-004
type: transformation-decision
section: transformation-decisions
title: Define and automate the multi-regime retention schedule with GDPR data deletion
status: draft
confidence: medium
source: M. Berger; source-target synthesis — corporate-account-closure wiki
decisionType: policy-and-control-redesign
decisionStatus: proposed
resolves: [PG-CAC-003]
realises: [TS-CAC-003]
fromIdea: [II-CAC-003]
provenance: {"Options considered": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "Rationale": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "The decision": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}}
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-19
---
## The decision
Define a unified retention schedule reconciling GwG (5 years), HGB § 257 (6/10 years), and AO § 147 (10 years); configure the Records Archive to enforce the schedule automatically; and implement a GDPR-compliant data deletion protocol that purges or anonymises personal data once all retention obligations have expired.

## Options considered
- Define the schedule and automate enforcement and deletion in the Records Archive
- Define the schedule and enforce manually (retain CP-CAC-007 quarterly review, add a deletion checklist)
- Adopt a Records Management System with native retention policy enforcement and GDPR deletion workflows
- Wait for AMLA Technical Standards (due July 2026) before defining the policy

## Rationale
Automation eliminates the current reliance on the quarterly manual review and closes the GDPR deletion gap (REG-CAC-007). Waiting for AMLA Technical Standards risks missing the July 2027 enforcement date; the GwG 5-year floor already provides the minimum anchor for the schedule.

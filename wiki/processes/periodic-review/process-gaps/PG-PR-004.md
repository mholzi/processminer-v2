---
id: PG-PR-004
type: process-gap
section: process-gaps
title: Beneficial-owner graphs incomplete for pre-2018 clients
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
area: As-Is Process
gapStatus: open
severity: Medium
owner: Data
targetClose: Q4 2027 (remediation programme)
affects: [PS-PR-002, PS-PR-003]
provenance: {"Impact": {"evidence": "When the case opens it is pre-populated with Beneficial-owner graph (Entity Resolution Service). (Section 3 Step 2); STP eligibility requires completeness >= 92. (Section 3 Step 3); cases not meeting completeness are routed to Reviewer Triage. (Section 3 Step 3)", "source": "document"}, "Next step": {"evidence": "Mitigation: remediation programme PRJ-ENT-BO (separate plan). (Section 5.3); G-06: Owner: Data. Target close: Q4 2027 (remediation programme). (Section 9 Gap Log)", "source": "document"}, "The gap": {"evidence": "Data quality in legacy entity records. Beneficial-owner graphs for entities onboarded pre-2018 are incomplete. Mitigation: remediation programme PRJ-ENT-BO (separate plan). (Section 5.3 Residual risks accepted); G-06: Beneficial-owner graphs incomplete pre-2018. Owner: Data. Target close: Q4 2027 (remediation programme). (Section 9 Gap Log)", "source": "document"}}
---
## The gap
Beneficial-owner (BO) graphs held in the Entity Resolution Service are incomplete for legal-entity clients onboarded before 2018. The structured BO data required to pre-fill cases and support STP eligibility is absent or unreliable for this legacy cohort.

## Impact
Cases without complete BO graphs cannot reach the completeness score (>= 92) required for STP eligibility and are routed to manual Reviewer Triage regardless of the client's current risk rating.

## Next step
Execute a BO data remediation programme (PRJ-ENT-BO) to back-populate the Entity Resolution Service for pre-2018 clients. Owner: Data. Target close: Q4 2027 (remediation programme).

---
id: REQ-BGID-003
type: requirement
section: requirements
title: Portal Must Block Submission When Mandatory Fields Are Missing
status: draft
confidence: high
source: SME interview — transformation-agent session 2026-05-26
reqType: FUNCTIONAL
moscow: MUST
derivedFrom: [TD-BGID-003]
addresses: [VG-BGID-001]
updatedBy: admin
updatedAt: 2026-05-26T09:28:32Z
---
## Requirement
The Corporate Portal's application submission control must be disabled when any mandatory field is unpopulated; it must enable only when all mandatory fields — including commercial contract reference, beneficiary name, guarantee amount and validity period — carry valid values.

## Rationale
System-level blocking is the only mechanism that provably eliminates incomplete submissions; warning-only and procedural controls have not worked in the As-Is process, where the manual TFO completeness check does not reliably catch missing fields before applications advance.

## Acceptance criteria
- Submitting with each mandatory field missing in turn is rejected by the portal interface — the submission action is not reachable
- An inline validation message identifies each missing or invalid field before the user reaches the submission control
- A test submission with all mandatory fields populated is accepted and creates an application record in TFS

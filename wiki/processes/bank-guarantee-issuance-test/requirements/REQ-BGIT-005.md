---
id: REQ-BGIT-005
type: requirement
section: requirements
title: STP rate target: 70% of standard applications processed end-to-end without manual intervention
status: draft
confidence: high
source: transformation-agent — M. Berger, 2026-05-20
reqType: NON-FUNCTIONAL
moscow: SHOULD
derivedFrom: [TD-BGIT-001, TD-BGIT-002, TD-BGIT-003]
addresses: [PP-BGIT-001, PP-BGIT-002, PP-BGIT-003]
---
## Requirement
At least 70% of standard bank guarantee applications — in-limit facility, standard ICC wording — shall be processed from submission to SWIFT dispatch without any manual intervention by Trade Finance Operations, as measured over a rolling three-month window.

## Rationale
The current STP rate of approximately 52% reflects manual bottlenecks at intake validation (CG-BGIT-001), credit pre-check (PP-BGIT-001) and wording review (PP-BGIT-002). The ICC-SWIFT API (TD-BGIT-001), real-time credit advisory (TD-BGIT-002) and Legal workflow automation (TD-BGIT-003) together target 70% STP, consistent with HSBC and Standard Chartered benchmarks.

## Acceptance criteria
- STP rate measured monthly against the rolling three-month baseline and reported in the process metrics dashboard
- Standard in-limit applications constitute the denominator; bespoke-wording and facility-referral cases are excluded
- A shadow-run period of at least sixty calendar days validates the measurement methodology before the target is declared live
- Any automated rejection that a human subsequently approves is recategorised as a manual intervention for measurement purposes

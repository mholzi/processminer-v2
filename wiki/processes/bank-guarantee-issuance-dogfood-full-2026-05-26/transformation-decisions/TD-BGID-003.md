---
id: TD-BGID-003
type: transformation-decision
section: transformation-decisions
title: Smart Intake Portal with System-Level Mandatory Field Enforcement
status: draft
confidence: high
source: SME interview — transformation-agent session 2026-05-26
decisionType: portal design
decisionStatus: agreed
resolves: [PP-BGID-003, CG-BGID-001]
realises: [TS-BGID-001]
fromIdea: [II-BGID-002]
updatedBy: admin
updatedAt: 2026-05-26T09:27:02Z
---
## The decision
The Corporate Portal will enforce mandatory field completion — including commercial contract reference — at system level before an application can be submitted; the enforcement cannot be overridden by the applicant and applies to both portal and API submission paths.

## Options considered
- **System-level mandatory enforcement** — chosen: eliminates incomplete submissions at source; closes CG-BGID-001; no TFO discipline required
- **Warning-only approach** — flags missing fields but allows submission; preserves flexibility but perpetuates the rework cycle seen in PP-BGID-003
- **Offline checklist** — procedural control requiring TFO to verify completeness before advancing; unenforceable in practice and does not address the portal submission gap
- **Post-submission validation** — blocks the application after submission with a rejection notice; prevents downstream rework but imposes effort on the client after they have already submitted

## Rationale
System-level blocking is the only mechanism that provably eliminates incomplete submissions; warning-only and procedural controls have demonstrably not worked in the As-Is process. Enforcement at submission also closes CG-BGID-001 as a control gap without requiring a separate compensating control.

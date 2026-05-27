---
id: REQ-BGID-005
type: requirement
section: requirements
title: Legal SLA and clause library in place before AI classifier shadow phase
status: draft
confidence: low
source: wiki-synthesis-2026-05-26
reqType: NON-FUNCTIONAL
moscow: MUST
derivedFrom: [TD-BGID-005]
addresses: [PP-BGID-002]
updatedBy: admin
updatedAt: 2026-05-26T20:15:01Z
---
## Requirement
A formal 2-business-day SLA for bespoke wording review must be agreed with Legal, and a structured clause library covering at least 80% of historical standard-template cases must be built and in use before the AI classifier's shadow-mode phase begins.

## Rationale
The AI classifier depends on an authoritative clause library as training ground truth. Without the library and a baseline SLA, shadow-mode classification cannot be validated and the accuracy gate cannot be measured against a meaningful standard.

## Acceptance criteria
- A signed SLA agreement between Trade Finance and Legal is in place before the shadow-mode period begins.
- The clause library covers at least 80% of standard-template wording forms used in the prior 12 months.
- SLA compliance is monitored monthly and reported to the Trade Finance Manager.

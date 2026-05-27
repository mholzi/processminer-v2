---
id: PP-BGID-002
type: pain-point
section: pain-points
title: Bespoke Wording Causes Unpredictable Delay
status: draft
confidence: HIGH
source: bank-guarantee-issuance-v1.md
category: delay
severity: MEDIUM
priority: P2
affects: [PS-BGID-003]
updatedBy: the assistant
updatedAt: 2026-05-26T05:19:01Z
---
## Description
When a client requests a guarantee with bespoke wording rather than the bank's standard template, the application must be sent to the Legal team for review and sign-off before issuance can proceed. Legal review has no committed turnaround time, making the delay duration unpredictable.

## Impact
The absence of an SLA for Legal review means bespoke-wording cases cannot be reliably included in the 3-business-day turnaround target. Downstream steps — approval and issuance — are blocked until Legal sign-off arrives.

## Root cause
Legal review of bespoke guarantee wording is treated as an ad-hoc activity with no formal SLA or queue management. There is no pre-approved clause library to reduce the volume of cases requiring full Legal review, and no escalation mechanism for delayed responses.

---
id: FP-DDMM-006
type: friction-point
section: friction-points
title: SL01 Restriction Applied with Zero Notification
status: draft
confidence: high
source: ddmm-client-journey-specialist
severity: HIGH
occursAt: [PS-DDMM-007]
---
## Description
When an SL01 R-transaction applies a collection restriction to a mandate, the creditor receives no notification of any kind — no portal message, no email — unlike MD01, MD02, and AC04 which at least generate a passive portal notification.

## Root cause
SL01 has no notification path by design omission; unlike MD01, MD02, and AC04, no portal notification was built for it. The bank is not prohibited from disclosing an SL01 restriction — the gap is a missing mechanism, not compliance.

## Client impact
The creditor does not discover the restriction until a collection attempt is rejected or refused. The silence may persist indefinitely; the creditor may continue submitting collections against the restricted mandate, incurring fees and reconciliation effort, unaware that the restriction exists.

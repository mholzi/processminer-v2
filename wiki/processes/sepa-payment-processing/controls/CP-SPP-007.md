---
id: CP-SPP-007
type: control
section: controls
title: End-of-day reconciliation vs CSM settlement
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
controlType: DETECTIVE
execution: MANUAL
owner: Payments Operations
step: [PS-SPP-010]
provenance: {"Control activity": {"evidence": "At end of day, submitted payments are reconciled against CSM settlement reports; any break is investigated.", "source": "document"}, "Risk addressed": {"evidence": "", "source": "proposed"}, "Timing": {"evidence": "End-of-day reconciliation vs CSM settlement | Detective / manual | Daily", "source": "document"}, "What it checks": {"evidence": "End-of-day reconciliation vs CSM settlement", "source": "document"}}
---
## What it checks
That every submitted payment settled as expected, by comparing submissions against the CSM settlement reports.

## Control activity
At end of day, submitted payments are reconciled against the CSM settlement reports and any break is investigated.

## Risk addressed
Without it, a payment that failed to settle or settled incorrectly could go unnoticed.

## Timing
Performed manually once a day, at end of day.

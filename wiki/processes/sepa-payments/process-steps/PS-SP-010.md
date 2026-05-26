---
id: PS-SP-010
type: process-step
section: process-steps
title: Reconciliation
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
owner: Payments Operations
sla: End of business day
condition: CSM settlement reports received for the day
systems: [SYS-SP-002, SYS-SP-003, SYS-SP-006]
provenance: {"Inputs": {"evidence": "", "source": "proposed"}, "Outputs": {"evidence": "", "source": "proposed"}, "What happens": {"evidence": "Step 10: 'At end of day, submitted payments are reconciled against CSM settlement reports; any break is investigated.' Control C-7: 'End-of-day reconciliation vs CSM settlement — Detective / manual — Daily.'", "source": "document"}, "Why it matters": {"evidence": "Control C-7: 'End-of-day reconciliation vs CSM settlement — Detective / manual.' Step 10: 'any break is investigated.'", "source": "document"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:15Z
---
## What happens
At end of day, Payments Operations reconciles all submitted payments against the settlement reports received from the CSM. Any break is flagged for investigation.

## Inputs
- End-of-day CSM settlement reports from RT1 and STEP2
- Submitted payment records from Core Banking System
- pacs.008 submission log from the CSM Gateway

## Outputs
- Reconciled payment register for the day
- List of breaks requiring investigation

## Why it matters
End-of-day reconciliation is the detective control (C-7) that identifies any payment submitted to the CSM but not confirmed, or settled without a matching internal record.

---
id: PS-SPP-010
type: process-step
section: process-steps
title: Reconciliation
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
owner: Payments Operations
systems: [SYS-SPP-002, SYS-SPP-006]
transitions: []
provenance: {"Inputs": {"evidence": "submitted payments are reconciled against CSM settlement reports", "source": "document"}, "Outputs": {"evidence": "Payments Operations runs end-of-day reconciliation and investigates any break the same day.", "source": "elicited"}, "What happens": {"evidence": "Payments Operations runs end-of-day reconciliation and investigates any break the same day — a confirmed non-settlement triggers the debit reversal.", "source": "elicited"}, "Why it matters": {"evidence": "Take this exception out. This is inbound after the process has been completed.", "source": "elicited"}}
approval: approved
approvalBy: Markus
approvalDate: 2026-05-18
---
## What happens
At end of day, Payments Operations reconciles the day's submitted payments against the CSM settlement reports. Any break between what was submitted and what settled is investigated the same day. A confirmed non-settlement triggers the debit reversal and re-credit described at the debit-booking step.

## Inputs
- The day's submitted payments
- CSM settlement reports

## Outputs
- Reconciled settlement record
- Reconciliation breaks routed to same-day investigation by Payments Operations

## Why it matters
End-of-day reconciliation against CSM settlement confirms every submitted payment settled as expected under Control C-7. It catches a standard SCT that failed to settle and triggers the debit reversal; inbound returns against originated payments are handled out of scope by the separate inbound process (PRC-OPS-0174).

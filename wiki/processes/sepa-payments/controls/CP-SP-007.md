---
id: CP-SP-007
type: control
section: controls
title: End-of-day reconciliation vs CSM settlement
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
controlType: DETECTIVE
execution: MANUAL
effectiveness: MEDIUM
owner: Payment Operations
step: [PS-SP-010]
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:00Z
---
## What it checks
Confirms that every payment submitted to the CSM during the day is reflected in the CSM settlement reports and that submitted amounts match settled amounts, identifying any breaks between the bank's records and scheme settlement.

## Control activity
At end of day, Payments Operations reconciles the list of submitted pacs.008 messages against the CSM settlement reports. Any break — a submitted payment not confirmed as settled or a value discrepancy — is investigated and escalated, with resolution targeted within one business day.

## Risk addressed
Undetected settlement failures, posting errors, or fraudulent transactions not appearing in settlement, leading to financial loss, regulatory reporting failures, or client harm.

## Timing
Performed once daily at end of day after the final settlement cycle completes.

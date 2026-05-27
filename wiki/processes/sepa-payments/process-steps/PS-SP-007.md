---
id: PS-SP-007
type: process-step
section: process-steps
title: Debit booking
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
owner: Payments Operations
sla: Executed before CSM submission
condition: Rail selection complete; for bulk files, 4-eyes approval received from Ops Approver
systems: [SYS-SP-002, SYS-SP-003]
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:15Z
---
## What happens
The Payment Hub instructs the Core Banking System to debit the customer account for the payment amount. The funds earmarked during the funds check step are released into the outbound payment debit.

## Inputs
- Rail selection result from routing decision step
- Earmarked funds reference from the funds check and hold step
- Debtor account number and debit amount
- 4-eyes approval token for bulk file payments

## Outputs
- Confirmed debit posting on the customer account
- Released payment amount available for CSM submission

## Why it matters
The debit booking releases the earmarked funds and commits the payment amount for submission to clearing. For bulk files, the 4-eyes approval gate must be satisfied before this step proceeds.

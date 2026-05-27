---
id: PS-SP-003
type: process-step
section: process-steps
title: Funds check and hold
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
owner: Payments Operations
sla:
condition: Instruction has passed all validation checks in Step 2
systems: [SYS-SP-002, SYS-SP-003]
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:15Z
---
## What happens
The debtor account is queried in the core banking system for available balance, factoring in intraday credit limits. If the balance is sufficient, the payment amount is earmarked (held) on the account, ring-fencing it from concurrent transactions. If the balance is insufficient the instruction is routed to Exception E-2: single payments are rejected; bulk-file items are queued to the next cycle.

## Inputs
- Validated payment instruction from Step 2
- Debtor account balance from Core Banking System
- Intraday limit parameters for the debtor account

## Outputs
- Earmark / hold placed on the debtor account for the payment amount
- Instruction cleared to proceed to sanctions and AML screening

## Why it matters
Earmarking the funds before the payment enters the clearing chain prevents overdrafts and ensures the debit booking in Step 7 will always succeed, protecting both the bank and the customer from settlement failures caused by concurrent debits.

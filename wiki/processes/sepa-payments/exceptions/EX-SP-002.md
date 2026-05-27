---
id: EX-SP-002
type: exception
section: exceptions
title: Insufficient funds
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
category: funds
impact: MEDIUM
handlingOwner: Payments Operations
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:00Z
---
## Description
The debtor account does not hold sufficient available balance, including intraday limits, to cover the payment amount at the time of the funds check and hold step.

## Handling
Single payments are rejected and the customer is notified. For bulk-file payments, individual items that fail the funds check are queued to the next processing cycle and the customer is notified.

## Impact
For single payments, the beneficiary does not receive funds on the intended value date and the customer must top up and resubmit. For bulk files, delayed items create operational risk.

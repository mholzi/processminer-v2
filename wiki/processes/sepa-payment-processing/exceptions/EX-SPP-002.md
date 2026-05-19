---
id: EX-SPP-002
type: exception
section: exceptions
title: Insufficient funds
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
category: Funding
impact: LOW
affects: [PS-SPP-003]
provenance: {"Description": {"evidence": "a looped-back payment that fails the funds check is the same reject", "source": "elicited"}, "Handling": {"evidence": "the customer was already told it was processing, so Ops contacts them directly. And bulk items requeue for up to three cycles, then we reject the item and tell the file owner.", "source": "elicited"}, "Impact": {"evidence": "a looped-back payment that fails the funds check is the same reject ... bulk items requeue for up to three cycles", "source": "elicited"}}
approval: in-progress
---
## Description
The debtor account does not have enough available balance, including intraday limits, to cover the payment when the funds check runs — whether on the first pass, or when a payment released from a downstream sanctions or fraud hold loops back for a fresh check.

## Handling
A single payment is rejected to the customer. One looping back from a sanctions or fraud hold that fails this check is rejected likewise, but Payments Operations contacts the customer directly since they were told it was processing. Bulk-file items requeue to the next cycle; one still unfunded after three cycles is rejected and the file owner told.

## Impact
A single payment fails and must be re-attempted; a looped-back payment fails after the customer believed it was on its way. Bulk items are delayed by up to three cycles rather than lost, then rejected if still unfunded.

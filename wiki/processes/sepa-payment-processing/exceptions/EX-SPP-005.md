---
id: EX-SPP-005
type: exception
section: exceptions
title: SCT Inst timeout or beneficiary-bank rejection
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
category: Instant settlement
impact: LOW
affects: [PS-SPP-009]
provenance: {"Description": {"evidence": "SCT Inst timeout or beneficiary-bank rejection", "source": "document"}, "Handling": {"evidence": "Fallback path keeps the booked debit; return path reverses it and re-credits. 'Eligible' just means it still fits standard SCT routing.", "source": "elicited"}, "Impact": {"evidence": "return path reverses it and re-credits", "source": "elicited"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-18
---
## Description
An SCT Inst attempt times out or is rejected by the beneficiary bank, so the payment does not settle on the instant rail within the 10-second window.

## Handling
Where the payment still meets the standard SCT routing rules, it falls back automatically to the standard SCT rail and the debit already booked stands. Otherwise it is returned to the customer, with the debit reversed and the funds re-credited.

## Impact
The payment is not instant: it either completes more slowly as a standard SCT, or is returned and unwound for the customer to re-attempt.

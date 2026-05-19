---
id: PS-SPP-007
type: process-step
section: process-steps
title: Debit booking
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
owner: Core Banking System
systems: [SYS-SPP-003]
provenance: {"Inputs": {"evidence": "The customer account is debited and the held amount released into the payment.", "source": "document"}, "Outputs": {"evidence": "The customer account is debited and the held amount released into the payment.", "source": "document"}, "What happens": {"evidence": "Take this exception out. This is inbound after the process has been completed.", "source": "elicited"}, "Why it matters": {"evidence": "yes — confirmed that when a payment is debited and then fails to settle, the debit is reversed and the funds re-credited", "source": "elicited"}}
transitions: [PS-SPP-008|normal|]
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-18
---
## What happens
The customer account is debited and the amount previously held is released into the payment, converting the earmark into a posted debit. The debit posts before clearing submission; if the payment subsequently fails to settle, the debit is reversed and the funds re-credited (see Exception E-5 for an SCT Inst timeout fallback or return). A standard SCT returned by the beneficiary side is an inbound R-transaction, handled by the separate inbound process (PRC-OPS-0174) outside this process's scope.

## Inputs
- Routed payment instruction
- Earmarked hold on the debtor account

## Outputs
- Posted debit on the customer account
- Funded payment ready for clearing submission

## Why it matters
Booking the debit before submission ensures the payment is funded by the time it reaches the clearing and settlement mechanism. It is also the point of financial exposure: from here the customer's account stands debited, so a payment that then fails to settle must be unwound — the debit reversed and the funds re-credited.

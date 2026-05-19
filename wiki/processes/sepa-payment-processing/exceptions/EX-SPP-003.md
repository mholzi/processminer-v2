---
id: EX-SPP-003
type: exception
section: exceptions
title: Confirmed sanctions/AML hit
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
category: Sanctions / AML
impact: HIGH
handlingOwner: Compliance / Financial Crime
affects: [PS-SPP-004]
provenance: {"Description": {"evidence": "Confirmed sanctions/AML hit ... potential hits route to Compliance", "source": "document"}, "Handling": {"evidence": "A confirmed hit is never released — we cancel the payment and report it to the authorities. Screening's before the debit so there's nothing to reverse.", "source": "elicited"}, "Impact": {"evidence": "the customer isn't told it was a sanctions or AML hit — tipping-off rules", "source": "elicited"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-18
---
## Description
Sanctions or AML screening produces a hit that is confirmed on review — the debtor, creditor or payment matches a sanctions list or shows money-laundering indicators.

## Handling
The payment is frozen and escalated to Compliance and Financial Crime; release is blocked pending the investigation. A confirmed hit is not released — the payment is cancelled and the matter reported to the authorities as required. Because screening runs before debit booking, no customer debit has posted, so there is nothing to reverse.

## Impact
The payment is cancelled and never settles. The customer is not given the specific screening reason, under tipping-off rules, and the matter may be reported to the authorities.

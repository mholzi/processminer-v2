---
id: EX-SPP-004
type: exception
section: exceptions
title: High fraud score
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
category: Fraud
impact: MEDIUM
provenance: {"Description": {"evidence": "High fraud score ... high-risk items are held for review", "source": "document"}, "Handling": {"evidence": "Payment held; customer contacted for step-up verification; released or cancelled on the outcome.", "source": "document"}, "Impact": {"evidence": "Payment held; customer contacted for step-up verification; released or cancelled on the outcome.", "source": "document"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-18
---
## Description
The fraud engine scores a payment as high-risk during real-time fraud screening, so it cannot pass automatically and is held.

## Handling
The payment is held and the customer is contacted for step-up verification. It is released or cancelled depending on the outcome of that verification.

## Impact
The payment is delayed while the customer completes step-up verification, and is cancelled if the verification is not satisfied.

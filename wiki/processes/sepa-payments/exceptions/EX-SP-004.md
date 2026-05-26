---
id: EX-SP-004
type: exception
section: exceptions
title: High fraud score
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
category: fraud
impact: HIGH
handlingOwner: Fraud
provenance: {"Description": {"evidence": "Step 5: 'The payment is scored in real time by the fraud engine. Low-risk items pass; high-risk items are held for review.'", "source": "document"}, "Handling": {"evidence": "Section 6 E-4: 'Payment held; customer contacted for step-up verification; released or cancelled on the outcome.'", "source": "document"}, "Impact": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:00Z
---
## Description
The real-time fraud engine scores the payment as high-risk and holds it for review.

## Handling
The payment is held and the customer is contacted for step-up verification. The payment is released if verification passes or cancelled if it fails.

## Impact
Genuine payments experience delays, which may cause customer dissatisfaction for time-sensitive transfers. Fraudulent payments that are successfully held prevent direct financial loss.

---
id: ROLE-SP-005
type: role
section: roles
title: Fraud
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
systems: [SYS-SP-005]
controls: [CP-SP-005]
provenance: {"In this process": {"evidence": "Step 5: 'The payment is scored in real time by the fraud engine. Low-risk items pass; high-risk items are held for review.' Exception E-4: 'Payment held; customer contacted for step-up verification; released or cancelled on the outcome.' RACI: Fraud = I for all rows except Fraud screening (A/R).", "source": "document"}, "Responsibility": {"evidence": "RACI table Section 4: Fraud screening — Fraud = A/R. Section 5.1 step 5: 'The payment is scored in real time by the fraud engine. Low-risk items pass; high-risk items are held for review.' Exception E-4: 'Payment held; customer contacted for step-up verification; released or cancelled on the outcome.'", "source": "document"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:15Z
---
## Responsibility
Accountable for real-time fraud screening of payment instructions and for the review and disposition of high-risk payment holds.

## In this process
The Fraud team owns step ps-5 (Fraud Screening): the fraud engine scores each payment in real time and items flagged as high-risk are held for review. Fraud contacts the customer for step-up verification when required and decides to release or cancel the payment (exception E-4). For all other process steps the Fraud role is Informed.

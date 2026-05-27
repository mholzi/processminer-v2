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
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:15Z
---
## Responsibility
Accountable for real-time fraud screening of payment instructions and for the review and disposition of high-risk payment holds.

## In this process
The Fraud team owns step ps-5 (Fraud Screening): the fraud engine scores each payment in real time and items flagged as high-risk are held for review. Fraud contacts the customer for step-up verification when required and decides to release or cancel the payment (exception E-4). For all other process steps the Fraud role is Informed.

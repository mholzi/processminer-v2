---
id: CP-SP-005
type: control
section: controls
title: Real-time fraud scoring
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
controlType: DETECTIVE
execution: AUTOMATED
effectiveness: HIGH
owner: Fraud
step: [PS-SP-005]
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:00Z
---
## What it checks
Assesses the fraud risk of each payment instruction by scoring it in real time using the fraud engine, identifying instructions flagged as high-risk.

## Control activity
The Fraud Engine scores every payment automatically. Low-risk items pass through without delay. High-risk items are held and the customer is contacted for step-up verification; the payment is released or cancelled based on the verification outcome.

## Risk addressed
Authorised-push-payment fraud and account-takeover fraud where a criminal causes the account holder or the bank to execute a payment to a fraudulent beneficiary.

## Timing
Runs on every item after sanctions and AML screening in real time before routing and debit booking.

---
id: PS-SP-005
type: process-step
section: process-steps
title: Fraud screening
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
owner: Fraud
sla:
condition: Instruction has cleared sanctions and AML screening in Step 4
systems: [SYS-SP-002, SYS-SP-005]
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:15Z
---
## What happens
The fraud engine scores the payment in real time using behavioural and transactional signals. Low-risk items pass immediately. High-risk items are held: the customer is contacted for step-up verification, and the payment is either released or cancelled based on the outcome of that verification (Exception E-4).

## Inputs
- Payment instruction details (amount, creditor IBAN, channel)
- Real-time fraud scoring output from the Fraud Engine

## Outputs
- Fraud risk score and pass / hold decision
- Instruction cleared to proceed to routing decision (on low-risk result)
- Held payment record and customer step-up verification request (on high-risk result)

## Why it matters
Real-time fraud scoring is the last line of defence before a payment is irrevocably submitted to clearing. Catching high-risk transactions at this point prevents financial loss to the customer and the bank and limits the costly and reputationally damaging process of recalling already-submitted payments.

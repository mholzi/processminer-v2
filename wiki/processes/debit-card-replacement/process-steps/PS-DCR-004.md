---
id: PS-DCR-004
type: process-step
section: process-steps
title: Fraud exposure check
status: draft
confidence: high
source: dcr-dtp-mockup.md
owner: Fraud Analyst
condition: Only for cards reported lost or stolen
sla: Fraud exposure review completed within the same business day
systems: [SYS-DCR-001]
approval: approved
approvalBy: S. Krause
approvalDate: 2026-05-19
---
## What happens
For cards reported lost or stolen, the request is flagged to the Fraud Analyst, who reviews the card's recent transactions for unauthorised activity. Cards reported only as damaged skip this check entirely and move straight to the replacement order.

## Inputs
- A blocked card reported lost or stolen
- The card's recent transaction history

## Outputs
- A fraud assessment: clear, or suspicious activity found
- A fraud-case handover where suspicious activity is found

## Why it matters
Reviewing recent transactions catches unauthorised use that has already happened, so the bank can open a fraud case rather than silently replacing a card that has been compromised.

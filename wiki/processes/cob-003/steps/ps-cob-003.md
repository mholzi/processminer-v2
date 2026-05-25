---
id: PS-COB-003
type: process-step
section: process-steps
title: Credit Assessment
status: confirmed
confidence: high
source: DTP-BB-ONB-001 v2.3
sequence: 3
owner: Credit Analyst
sla: 3 business days
systems: [SYS-COB-006]
condition: If overdraft requested
approval: rejected
approvalBy: m.berger
approvalDate: 2026-05-16
---
## What happens
When the client has requested an overdraft facility, the Credit Analyst assesses creditworthiness using the credit decisioning system and external bureau data, applies the scorecard, and reaches a decision within their approval authority.

## Inputs
The cleared KYC file plus the client's requested facility amount and financial information.

## Outputs
An approved credit limit, a decline, or a referral to a higher approval authority.

## Why it matters
Responsible lending and credit-risk management. This step runs only when an overdraft is requested — for deposit-only onboarding it is skipped entirely.

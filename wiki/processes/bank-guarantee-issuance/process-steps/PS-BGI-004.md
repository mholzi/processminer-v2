---
id: PS-BGI-004
type: process-step
section: process-steps
title: Sanctions and Compliance Screening
status: draft
confidence: high
owner: Compliance Analyst
condition: Wording confirmed
systems: [SYS-BGI-003]
source: bank-guarantee-issuance-v1.md
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-19
---
## What happens
Once wording is confirmed, the application is automatically routed to the Compliance screening queue as a system task. The Compliance Analyst screens the beneficiary and the beneficiary's country against multiple sanctions lists — EU consolidated, OFAC, UN and the domestic German list — using the Sanctions Screening Tool. The screening result is attached to the application. A hit suspends the application pending a Compliance investigation.

## Inputs
- Application package with beneficiary details and beneficiary country
- Sanctions Screening Tool (EU consolidated, OFAC, UN, domestic German lists)

## Outputs
- Sanctions screening result attached to the application
- Application cleared for issuance approval, or suspended pending investigation

## Why it matters
The process is subject to anti-money-laundering and sanctions obligations (EU sanctions regulations, AML directives).

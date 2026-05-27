---
id: PS-SP-004
type: process-step
section: process-steps
title: Sanctions and AML screening
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
owner: Compliance
sla:
condition: Funds are held on the debtor account following Step 3
systems: [SYS-SP-002, SYS-SP-004, SYS-SP-007]
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:15Z
---
## What happens
Both the debtor and creditor are screened in real time against sanctions lists via the Sanctions Screening Engine, and the payment is simultaneously checked by AML transaction monitoring. Clean items pass automatically. Items generating a potential hit are routed to the Compliance team for manual review. If Compliance confirms the hit, the payment is frozen and escalated to Compliance and Financial Crime; release is blocked pending investigation (Exception E-3).

## Inputs
- Payment instruction with debtor and creditor details
- Current sanctions lists (maintained in the Sanctions Screening Engine)
- AML transaction monitoring rules and alert output

## Outputs
- Screening result: clear or potential hit
- Frozen payment record and escalation case (on confirmed hit)
- Instruction cleared to proceed to fraud screening (on clean result)

## Why it matters
Sanctions and AML screening is a non-negotiable regulatory obligation under EU and national AML/CFT frameworks. A missed hit exposes the bank to regulatory sanction and reputational damage; a false positive held too long degrades client service, so both accuracy and speed are material.

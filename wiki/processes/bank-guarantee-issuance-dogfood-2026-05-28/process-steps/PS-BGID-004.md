---
id: PS-BGID-004
type: process-step
section: process-steps
title: Sanctions and Compliance Screening
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
owner: Compliance Analyst
sla:
condition: Guarantee wording has been approved (standard or Legal-signed bespoke).
systems: [SYS-BGID-003]
updatedBy: the assistant
updatedAt: 2026-05-28T13:55:03Z
approval: approved
approvalBy: admin
approvalDate: 2026-05-28
---
## What happens
The Compliance Analyst screens the beneficiary and the beneficiary's country against the bank's sanctions list using the Sanctions Screening Tool. The screening result is attached to the application record. A screening hit suspends the application; Compliance Operations then owns a formal investigation with a 5-business-day target. If the investigation is unresolved after 5 business days, the application is formally declined and the client is notified.

## Inputs
- Application record with beneficiary name and country
- Approved guarantee wording from Wording Review
- Current sanctions list loaded in the Sanctions Screening Tool

## Outputs
- Screening result (clear or hit) attached to the application
- Application cleared to proceed to Issuance Approval (if no hit)
- Suspended application referred to Compliance Operations investigation (if hit)
- Formally declined application with client notification (if investigation unresolved after 5 business days)

## Why it matters
Mandatory sanctions screening before issuance fulfils the bank's AML and sanctions obligations and prevents the bank from issuing guarantees in favour of sanctioned parties or in sanctioned jurisdictions.

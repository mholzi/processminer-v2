---
id: PS-BGID-004
type: process-step
section: process-steps
title: Sanctions and Compliance Screening
status: draft
source: bank-guarantee-issuance-v1.md
owner: Compliance Analyst
sla:
condition: Wording approved and application ready for screening
systems: [SYS-BGID-003]
updatedBy: the assistant
updatedAt: 2026-05-26T05:17:42Z
---
## What happens
The Compliance Analyst screens the beneficiary and the beneficiary's country against the bank's sanctions list using the Sanctions Screening Tool. The screening result is attached to the application record. A screening hit suspends the application pending Compliance investigation.

## Inputs
- Wording-approved application
- Beneficiary name and country
- Sanctions Screening Tool

## Outputs
- Screening result attached to the application (clear or hit)
- If clear: application passed to Issuance Approval
- If hit: application suspended pending Compliance investigation

## Why it matters
Screening every beneficiary before issuance is required under EU sanctions regulations and AML directives.

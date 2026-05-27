---
id: PS-BGIT-004
type: process-step
section: process-steps
title: Sanctions and Compliance Screening
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
owner: Compliance Analyst
systems: [SYS-BGIT-003]
approval: in-progress
---
## What happens
The Compliance Analyst screens the beneficiary and the beneficiary's country against the sanctions list using the Sanctions Screening Tool. A screening hit suspends the application pending Compliance investigation.

## Inputs
- Application with beneficiary details and country
- Sanctions list data in Sanctions Screening Tool

## Outputs
- Screening result attached to application
- Suspended application pending Compliance investigation (on a screening hit)

## Why it matters
Ensures the bank does not issue guarantees to sanctioned parties, satisfying AML and sanctions regulatory obligations.

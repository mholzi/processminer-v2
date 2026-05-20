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
transitions: [PS-BGIT-007|branch|partially secured no screening hit, PS-BGIT-005|branch|fully secured no screening hit, EX-BGIT-002|exception|screening hit]
provenance: {"Inputs": {"evidence": "M. Berger: standing approval", "source": "elicited"}, "Outputs": {"evidence": "the screening result is attached to the application", "source": "document"}, "What happens": {"evidence": "The Compliance Analyst screens the beneficiary and the beneficiary's country against the sanctions list. A screening hit suspends the application pending Compliance investigation.", "source": "document"}, "Why it matters": {"evidence": "M. Berger: standing approval", "source": "elicited"}}
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

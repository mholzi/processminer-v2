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
condition: Approved wording confirmed
systems: [SYS-BGID-003]
provenance: {"Inputs": {"evidence": "[Y] Accept", "source": "elicited"}, "Outputs": {"evidence": "[Y] Accept", "source": "elicited"}, "What happens": {"evidence": "[Y] Accept", "source": "elicited"}, "Why it matters": {"evidence": "[Y] Accept", "source": "elicited"}}
updatedBy: the assistant
updatedAt: 2026-05-26T06:26:14Z
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-26
---
## What happens
The Compliance Analyst screens the beneficiary and the beneficiary's country against the sanctions list using the Sanctions Screening Tool. The screening result is attached to the application. If a screening hit is returned, the application is suspended and a Compliance investigation is initiated before any further processing.

## Inputs
- Application with beneficiary name and country
- Sanctions Screening Tool access

## Outputs
- Sanctions screening result record attached to application
- Cleared application forwarded to Issuance Approval (no hit)
- Suspended application pending investigation (hit)

## Why it matters
Mandatory AML and sanctions compliance check — failure to screen would expose the bank to regulatory sanction and reputational damage, and potentially facilitate sanctions evasion.

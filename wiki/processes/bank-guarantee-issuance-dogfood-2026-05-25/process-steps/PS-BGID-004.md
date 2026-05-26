---
id: PS-BGID-004
type: process-step
section: process-steps
title: Sanctions and Compliance Screening
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
owner: Compliance Analyst
systems: [SYS-BGID-003]
transitions: [PS-BGID-005|normal|screening is clear with no hits, EX-BGID-002|exception|sanctions screening hit is identified]
provenance: {"Inputs": {"evidence": "beneficiary and the beneficiary's country; Sanctions Screening Tool — used by Compliance for beneficiary screening.", "source": "document"}, "Outputs": {"evidence": "the screening result is attached to the application (C2); A screening hit suspends the application pending Compliance investigation.", "source": "document"}, "What happens": {"evidence": "The Compliance Analyst screens the beneficiary and the beneficiary's country against the sanctions list. A screening hit suspends the application pending Compliance investigation.", "source": "document"}, "Why it matters": {"evidence": "The process is subject to anti-money-laundering and sanctions obligations (EU sanctions regulations, AML directives).", "source": "document"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:56:10Z
---
## What happens
The Compliance Analyst runs the beneficiary name and beneficiary country through the Sanctions Screening Tool against the sanctions list. If the screening returns a hit, the application is suspended pending Compliance investigation. A clear result is recorded against the application and it proceeds to approval.

## Inputs
- Application with approved wording
- Beneficiary name and country
- Sanctions Screening Tool

## Outputs
- Screening result attached to the application record
- Application cleared for issuance approval (if no hit) or suspended for investigation (if hit)

## Why it matters
Sanctions screening is a regulatory obligation under EU sanctions regulations and AML directives. Issuing a guarantee to a sanctioned beneficiary or in a prohibited jurisdiction would expose the bank to severe regulatory penalties.

---
id: PS-BGID-005
type: process-step
section: process-steps
title: Issuance Approval
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
owner: Trade Finance Manager
sla:
condition: Sanctions screening cleared
systems: [SYS-BGID-002]
updatedBy: the assistant
updatedAt: 2026-05-26T06:29:07Z
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-26
---
## What happens
A Trade Finance Manager reviews the assembled application package — including beneficiary details, guarantee amount, wording, facility confirmation and sanctions screening result — and approves issuance in the Trade Finance System. Guarantees above EUR 5 million additionally require sign-off by the Head of Trade Finance; this threshold is system-enforced — the Trade Finance System requires the Head of Trade Finance's in-app approval before issuance can proceed.

## Inputs
- Complete application package (all prior step outputs)
- Facility confirmation record
- Legal sign-off (if bespoke wording)
- Sanctions screening result

## Outputs
- Approval recorded in Trade Finance System
- Authorised application ready for guarantee generation

## Why it matters
Implements the mandatory four-eyes issuance control — no guarantee is issued without a named manager's approval recorded in the system, protecting the bank against unauthorised commitments.

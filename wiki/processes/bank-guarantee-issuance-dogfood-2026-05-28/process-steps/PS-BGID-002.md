---
id: PS-BGID-002
type: process-step
section: process-steps
title: Credit and Facility Check
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
owner: Trade Finance Officer
sla:
condition: Application has passed the completeness check in Application Intake.
systems: [SYS-BGID-002]
updatedBy: the assistant
updatedAt: 2026-05-28T13:50:49Z
approval: approved
approvalBy: admin
approvalDate: 2026-05-28
---
## What happens
The Trade Finance Officer confirms the client holds an approved guarantee facility with sufficient available limit to cover the requested guarantee amount. If the limit is insufficient, the application is parked and routed to the Credit team. This is the most common reason for delay in the process. Once the Credit team resolves the limit issue, the application re-enters this step for re-check before continuing.

## Inputs
- Complete application record from Application Intake
- Client's approved guarantee facility record in the Trade Finance System
- Current facility utilisation and available limit
- Requested guarantee amount and currency

## Outputs
- Confirmed facility availability (application proceeds to Wording Review)
- Parked application routed to Credit team (if limit is insufficient)
- Facility check result recorded in the Trade Finance System

## Why it matters
Checking facility availability before any further processing surfaces the most common delay trigger early so it can be resolved before legal and compliance resources are engaged.

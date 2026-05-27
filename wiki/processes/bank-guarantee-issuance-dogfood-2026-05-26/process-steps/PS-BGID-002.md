---
id: PS-BGID-002
type: process-step
section: process-steps
title: Credit and Facility Check
status: draft
source: bank-guarantee-issuance-v1.md
owner: Trade Finance Officer
sla:
condition: Complete application received from ps-1
systems: [SYS-BGID-002]
updatedBy: the assistant
updatedAt: 2026-05-26T05:17:42Z
---
## What happens
The Trade Finance Officer confirms that the client holds an approved guarantee facility with sufficient available limit to cover the requested guarantee amount. If the available limit is insufficient, the application is parked and routed to the Credit team. This is the most common reason for delay in the process.

## Inputs
- Completeness-verified application from Application Intake
- Client's guarantee facility record

## Outputs
- Facility check result (sufficient / insufficient)
- If sufficient: application cleared to proceed to Wording Review
- If insufficient: application parked and routed to Credit team

## Why it matters
The facility check ensures the bank's credit risk exposure is authorised before issuance proceeds. Routing to the Credit team when the limit is short is the most common reason for delay, making this the highest-frequency exception in the process.

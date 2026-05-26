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
condition: Complete application received from step 1
systems: [SYS-BGID-002]
provenance: {"Inputs": {"evidence": "[Y] Accept", "source": "elicited"}, "Outputs": {"evidence": "[Y] Accept", "source": "elicited"}, "What happens": {"evidence": "[Y] Accept", "source": "elicited"}, "Why it matters": {"evidence": "[Y] Accept", "source": "elicited"}}
updatedBy: the assistant
updatedAt: 2026-05-26T06:25:13Z
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-26
---
## What happens
The Trade Finance Officer confirms the client holds an approved guarantee facility in the Trade Finance System and that the available limit is sufficient to cover the requested guarantee amount. If the limit is insufficient, the application is parked and routed to the Credit team for a limit increase; this is identified in the document as the most common cause of delay.

## Inputs
- Validated application from Application Intake
- Client's guarantee facility record in Trade Finance System
- Requested guarantee amount and currency

## Outputs
- Confirmed facility limit adequacy (pass) allowing progression to Wording Review
- Parked application and Credit team referral (fail) pending limit increase

## Why it matters
Prevents issuance of a guarantee that would breach the client's approved credit limit, protecting the bank's credit risk position.

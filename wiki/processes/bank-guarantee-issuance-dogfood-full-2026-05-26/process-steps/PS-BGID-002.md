---
id: PS-BGID-002
type: process-step
section: process-steps
title: Credit and Facility Check
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
owner: Trade Finance Officer
sla: same business day (informal)
condition: Complete application received from step 1
systems: [SYS-BGID-002]
provenance: {"Inputs": {"evidence": "[Y] Accept", "source": "elicited"}, "Outputs": {"evidence": "[Y] Accept", "source": "elicited"}, "What happens": {"evidence": "", "source": "proposed"}, "Why it matters": {"evidence": "[Y] Accept", "source": "elicited"}}
updatedBy: admin
updatedAt: 2026-05-26T18:35:12Z
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-26
transitions: [PS-BGID-003|normal|all four checks pass]
---
## What happens
The Trade Finance Officer checks four criteria against the client's facility record in the Trade Finance System: available limit covers the requested guarantee amount, facility expiry extends past the guarantee tenor, facility currency matches the guarantee, and the facility type permits bank guarantees. A clean pass on all four advances the application to Wording Review. A limit shortfall or expired facility parks the application and triggers a Credit team referral — the most common cause of delay. A currency mismatch or wrong product type returns it to the Relationship Manager for client resolution before resubmission.

## Inputs
- Validated application from Application Intake
- Client's guarantee facility record in Trade Finance System
- Requested guarantee amount and currency

## Outputs
- Confirmed facility limit adequacy (pass) allowing progression to Wording Review
- Parked application and Credit team referral (fail) pending limit increase

## Why it matters
Prevents issuance of a guarantee that would breach the client's approved credit limit, protecting the bank's credit risk position.

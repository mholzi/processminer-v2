---
id: PS-BGID-001
type: process-step
section: process-steps
title: Application Intake
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
owner: Trade Finance Officer
sla:
condition:
systems: [SYS-BGID-001]
provenance: {"Inputs": {"evidence": "[Y] Accept as drafted", "source": "elicited"}, "Outputs": {"evidence": "[Y] Accept as drafted", "source": "elicited"}, "What happens": {"evidence": "incomplete app → officer returns it via the portal with a checklist (no defined SLA — usually same day)", "source": "elicited"}, "Why it matters": {"evidence": "[Y] Accept as drafted", "source": "elicited"}}
updatedBy: the assistant
updatedAt: 2026-05-26T06:11:34Z
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-26
---
## What happens
The Trade Finance Officer receives the guarantee application submitted via the Corporate Portal and checks it is complete. Required fields verified are: beneficiary details, guarantee amount, currency, wording type (standard or bespoke), validity period and the underlying commercial contract reference. Incomplete applications are returned to the client via the portal with a checklist; there is no defined SLA for resubmission, but officers typically resolve same-day.

## Inputs
- Client's guarantee application submitted via Corporate Portal
- Beneficiary details
- Guarantee amount and currency
- Wording type selection (standard or bespoke)
- Validity period
- Commercial contract reference

## Outputs
- Validated complete application ready for credit check
- Identified wording type (standard or bespoke) to route subsequent steps

## Why it matters
Ensures all data required for credit, compliance and legal review is present before downstream steps begin, preventing rework caused by incomplete submissions.

---
id: PS-BGID-001
type: process-step
section: process-steps
title: Application Intake
status: draft
owner: Trade Finance Officer
sla:
condition:
systems: [SYS-BGID-001, SYS-BGID-002]
provenance: {"Inputs": {"evidence": "The Trade Finance Officer receives the application and checks it is complete: beneficiary details, guarantee amount, currency, wording type (standard or bespoke), validity period and the underlying commercial contract reference.", "source": "document"}, "Outputs": {"evidence": "", "source": "proposed"}, "What happens": {"evidence": "Officer also opens a draft record in the Trade Finance System at intake. Incomplete-app path: officer returns it to the client/RM with a checklist of missing fields.", "source": "elicited"}, "Why it matters": {"evidence": "", "source": "proposed"}}
source: bank-guarantee-issuance-v1.md
updatedBy: the assistant
updatedAt: 2026-05-26T05:27:52Z
---
## What happens
The Trade Finance Officer receives the guarantee application via the Corporate Portal and immediately opens a draft record in the Trade Finance System. The officer checks that the application is complete: beneficiary details, guarantee amount, currency, wording type (standard or bespoke), validity period and the underlying commercial contract reference. If the application is incomplete, the officer returns it to the client or RM with a checklist of missing fields; processing does not advance until a complete resubmission is received.

## Inputs
- Guarantee application submitted via the Corporate Portal
- Beneficiary details
- Guarantee amount and currency
- Wording type (standard or bespoke)
- Validity period
- Underlying commercial contract reference

## Outputs
- Completeness-verified application with draft record opened in the Trade Finance System, ready for credit and facility check
- Return notice to client or RM with checklist of missing fields (on incomplete resubmission path)

## Why it matters
Catching incomplete applications at intake prevents wasted effort downstream and avoids stalls at later steps where missing data would force a return to the client.

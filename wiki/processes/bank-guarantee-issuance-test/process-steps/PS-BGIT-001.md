---
id: PS-BGIT-001
type: process-step
section: process-steps
title: Application Intake
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
owner: Trade Finance Officer
condition: Client submits a Bank Guarantee application through the Corporate Portal, or via a relationship manager who keys it in
systems: [SYS-BGIT-001]
transitions: [PS-BGIT-002|normal|application is complete]
provenance: {"Inputs": {"evidence": "checks it is complete: beneficiary details, guarantee amount, currency, wording type (standard or bespoke), validity period and the underlying commercial contract reference.", "source": "document"}, "Outputs": {"evidence": "M. Berger confirmed: 'outputs and why-it-matters are fine'", "source": "elicited"}, "What happens": {"evidence": "The Trade Finance Officer receives the application and checks it is complete: beneficiary details, guarantee amount, currency, wording type (standard or bespoke), validity period and the underlying commercial contract reference.", "source": "document"}, "Why it matters": {"evidence": "M. Berger confirmed: 'outputs and why-it-matters are fine'", "source": "elicited"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-20
---
## What happens
The Trade Finance Officer receives the application through the Corporate Portal and checks it is complete, verifying beneficiary details, guarantee amount, currency, wording type (standard or bespoke), validity period, and the underlying commercial contract reference.

## Inputs
- Bank Guarantee application submitted via Corporate Portal
- Beneficiary details
- Guarantee amount and currency
- Wording type (standard or bespoke)
- Validity period
- Underlying commercial contract reference

## Outputs
- Validated complete application
- Application record ready for credit and facility check

## Why it matters
Ensures all required information is present before downstream processing begins, preventing incomplete applications from entering the issuance workflow.

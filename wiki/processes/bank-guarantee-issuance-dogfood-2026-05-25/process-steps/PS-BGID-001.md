---
id: PS-BGID-001
type: process-step
section: process-steps
title: Application Intake
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
owner: Trade Finance Officer
systems: [SYS-BGID-001, SYS-BGID-002]
transitions: [PS-BGID-002|normal|application is complete and accepted]
provenance: {"Inputs": {"evidence": "beneficiary details, guarantee amount, currency, wording type (standard or bespoke), validity period and the underlying commercial contract reference", "source": "document"}, "Outputs": {"evidence": "", "source": "proposed"}, "What happens": {"evidence": "The Trade Finance Officer receives the application and checks it is complete: beneficiary details, guarantee amount, currency, wording type (standard or bespoke), validity period and the underlying commercial contract reference. / A corporate client submits a Bank Guarantee application through the Corporate Portal, or via a relationship manager who keys it into the portal on the client's behalf.", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:56:10Z
---
## What happens
The Trade Finance Officer receives the guarantee application submitted via the Corporate Portal — either directly by the client or keyed in by a relationship manager. The officer checks the application is complete, verifying that all required fields are present: beneficiary details, guarantee amount, currency, wording type (standard or bespoke), validity period and the underlying commercial contract reference.

## Inputs
- Client-submitted guarantee application (via Corporate Portal)
- Beneficiary details
- Guarantee amount, currency and validity period
- Wording type selection (standard or bespoke)
- Underlying commercial contract reference

## Outputs
- Validated and complete application record
- Wording type classification (standard or bespoke) to route subsequent steps

## Why it matters
A complete, well-classified application prevents rework downstream. Missing data or an incorrect wording-type flag can cause delays at the credit check or legal review stage.

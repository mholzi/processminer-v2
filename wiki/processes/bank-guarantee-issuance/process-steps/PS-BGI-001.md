---
id: PS-BGI-001
type: process-step
section: process-steps
title: Application Intake
status: draft
confidence: high
owner: Trade Finance Officer
systems: [SYS-BGI-001]
transitions: [PS-BGI-002|normal|application is complete, EX-BGI-004|exception|application is incomplete]
provenance: {"Inputs": {"evidence": "For bid bonds / tender guarantees the guarantee is issued before any contract exists — at intake we accept the tender or solicitation reference instead.", "source": "elicited"}, "Outputs": {"evidence": "The Trade Finance Officer receives the application and checks it is complete: beneficiary details, guarantee amount, currency, wording type (standard or bespoke), validity period and the underlying commercial contract reference.", "source": "document"}, "What happens": {"evidence": "", "source": "proposed"}, "Why it matters": {"evidence": "The 'Why it matters' framing is fine.", "source": "elicited"}}
source: bank-guarantee-issuance-v1.md
approval: in-progress
---
## What happens
The Trade Finance Officer receives the guarantee application and verifies it is complete: beneficiary details, guarantee amount, currency, wording type (standard or bespoke), validity period, and the commercial contract or tender/solicitation reference.

Applications with missing information are held; the TFO contacts the client via the relationship manager to obtain the missing detail. A 5-business-day chase window is the recommended target before escalating to the Trade Finance Manager — pending sign-off from the Head of Trade Finance on final policy.

## Inputs
- Bank guarantee application submitted via Corporate Portal
- Beneficiary details
- Guarantee amount and currency
- Wording type designation (standard or bespoke)
- Underlying commercial contract reference, or tender/solicitation reference for bid bonds

## Outputs
- Validated and complete application package
- Wording type classification confirmed (standard or bespoke)

## Why it matters
The completeness check ensures all required information is captured before the application progresses.

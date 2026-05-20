---
id: CG-DCR-003
type: compliance-gap
section: control-gaps
title: No control over the accuracy of the reported reason at intake
status: draft
confidence: high
source: run-lint finding F-004 - S. Krause
severity: MEDIUM
gapStatus: open
provenance: {"Remediation": {"evidence": "S. Krause confirmed the remediation when working lint finding F-004.", "source": "elicited"}, "Risk": {"evidence": "S. Krause confirmed the mis-routing risk when working lint finding F-004.", "source": "elicited"}, "The gap": {"evidence": "S. Krause confirmed the intake control gap when working lint finding F-004.", "source": "elicited"}}
---
## The gap
Nothing checks that the reason captured at intake — lost, stolen, or damaged — is correct. PS-DCR-001 carries no control, yet the reported reason is what decides whether the fraud-exposure check runs.

## Risk
A mis-keyed reason mis-routes the request: a stolen card can skip the fraud-exposure check entirely, leaving unauthorised use undetected until the customer notices.

## Remediation
Add a validation or confirmation control at intake so the reported reason is checked before it routes the request, consistently across the phone and app channels.

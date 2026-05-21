---
id: CG-PR-005
type: compliance-gap
section: control-gaps
title: Risk-rating model not validated under STP load
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
severity: MEDIUM
gapStatus: open
control: [CP-PR-002]
provenance: {"Remediation": {"evidence": "", "source": "proposed"}, "Risk": {"evidence": "", "source": "proposed"}, "The gap": {"evidence": "", "source": "proposed"}}
---
## The gap
The risk-rating model has not been validated under the volume and case-mix distribution that would flow through the STP Decision Engine at full STP capacity (up to 70% of eligible cases).

## Risk
Medium exposure. Model drift under STP load could cause the engine to silently approve cases that should require human review, undermining the supervisory rationale for the 70% STP hard cap.

## Remediation
Conduct model validation before Case Manager go-live (2027 Q1). Implement quarterly model validation by MRM thereafter. Run a challenger model in shadow mode from go-live; the STP hard cap of 70% is removable only when the challenger model validation has

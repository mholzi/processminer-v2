---
id: PG-PR-006
type: process-gap
section: process-gaps
title: Risk-rating model not validated under STP load
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
area: As-Is Process
gapStatus: open
severity: Medium
owner: MRM
targetClose: Pre-go-live
affects: [PS-PR-003]
provenance: {"Impact": {"evidence": "Hard cap STP share at 70% of the eligible book, even if the model would route more. Rationale: 70% balances cost-out against the supervisory expectation that human review remains a material control. The cap is removable when challenger model validation has run for >= 12 months. (Section 8, D3)", "source": "document"}, "Next step": {"evidence": "Mitigation: quarterly model validation by Model Risk Management, challenger model in shadow, and hard caps on STP share (<= 70%). (Section 5.3); G-08: Owner: MRM. Target close: Pre-go-live. (Section 9 Gap Log)", "source": "document"}, "The gap": {"evidence": "G-08: Risk-rating model not validated under STP load. Owner: MRM. Target close: Pre-go-live. (Section 9 Gap Log); Model risk on STP eligibility. The risk-rating model can drift. (Section 5.3 Residual risks accepted)", "source": "document"}}
---
## The gap
The risk-rating model used to classify clients and determine review cadence has not been validated under the volume and data conditions that will apply when straight-through processing operates at scale.

## Impact
Model drift under STP load is an accepted residual risk. The 70% STP cap in Transformation Decision D3 exists partly as a safeguard: the cap is removable only when challenger model validation has run for at least 12 months.

## Next step
Complete model validation under STP-scale conditions before go-live and establish a challenger model programme in shadow. Owner: MRM. Target close: Pre-go-live.

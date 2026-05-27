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
---
## The gap
The risk-rating model used to classify clients and determine review cadence has not been validated under the volume and data conditions that will apply when straight-through processing operates at scale.

## Impact
Model drift under STP load is an accepted residual risk. The 70% STP cap in Transformation Decision D3 exists partly as a safeguard: the cap is removable only when challenger model validation has run for at least 12 months.

## Next step
Complete model validation under STP-scale conditions before go-live and establish a challenger model programme in shadow. Owner: MRM. Target close: Pre-go-live.

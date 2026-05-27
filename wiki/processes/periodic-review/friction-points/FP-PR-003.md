---
id: FP-PR-003
type: friction-point
section: friction-points
title: Re-uploading documents the bank already holds
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
severity: HIGH
occursAt: [MT-PR-003]
painPoint: [PP-PR-003]
addressedBy: [PS-PR-002, PS-PR-004]
---
## Description
During the information-request stage, clients are asked to re-upload identity documents — such as a passport or national ID — that the bank already holds from onboarding. The document names this friction explicitly as 'Re-uploading the ID the bank already holds.'

## Root cause
The As-Is process performs no check against existing holdings before requesting data. Evidence is scattered across four systems with manual reconciliation; the RM has no consolidated view of current documents. Over-collection is a named pain point in the As-Is summary.

## Client impact
Being asked to provide documents the bank demonstrably already possesses damages client trust and signals poor internal coordination. It adds unnecessary effort and, if the client has already gone through onboarding recently, feels particularly redundant — increasing the risk of non-response or complaint.

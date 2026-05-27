---
id: FP-DDMM-001
type: friction-point
section: friction-points
title: No Inline Validation on Submission
status: draft
confidence: high
source: ddmm-client-journey-specialist
severity: MEDIUM
occursAt: [PS-DDMM-001]
---
## Description
The mandate submission form in the Creditor Portal does not validate UMR and CI format rules inline. Errors are only detected after submission, when the mandate reaches the bank's validation step.

## Root cause
The portal form performs no client-side format validation; all validation logic sits in the bank's back-end mandate processing pipeline and only executes post-submission.

## Client impact
A first-time or infrequent user submits a mandate they believe is complete, waits for processing, then receives a rejection they cannot immediately interpret. The round-trip delay is especially costly when the creditor is working to meet a collection campaign deadline.

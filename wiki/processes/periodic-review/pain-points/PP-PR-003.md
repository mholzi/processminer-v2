---
id: PP-PR-003
type: pain-point
section: pain-points
title: Over-collection of client data
status: draft
confidence: medium
source: periodic-kyc-review-dtp.pdf
category: data collection
severity: MEDIUM
priority: P2
affects: [PS-PR-004]
---
## Description
During outreach the RM asks clients to supply refreshed identity documents, proof of address, source-of-wealth attestation, and an updated client profile questionnaire — including items the bank already holds from onboarding, ongoing transactions, or the customer master.

## Impact
Asking clients to re-provide data the bank already holds creates unnecessary friction and extends the outreach cycle. The As-Is outreach rate is 91% (Q1 2026). GDPR Art. 5(1)(c) and Art. 25 (data minimisation) are obligations the target process must satisfy.

## Root cause
No pre-fill mechanism exists to compute the minimal data delta before generating the client request, so the default outreach asks for all items regardless of what the bank already holds.

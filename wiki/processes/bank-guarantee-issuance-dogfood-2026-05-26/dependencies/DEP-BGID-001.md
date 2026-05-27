---
id: DEP-BGID-001
type: process-dependency
section: dependencies
title: Corporate Client or RM submitting the guarantee application
status: draft
confidence: low
source: wiki-synthesis-2026-05-26
direction: UPSTREAM
atStep: [PS-BGID-001]
viaSystem: [SYS-BGID-001]
updatedBy: admin
updatedAt: 2026-05-26T20:15:01Z
---
## The dependency
The issuance process is triggered by a corporate client or their relationship manager submitting a guarantee application via the Corporate Portal. Without this upstream input the process cannot start.

## What crosses the boundary
A complete guarantee application — beneficiary details, guarantee amount, currency, wording type, validity period and commercial contract reference — is submitted by the client. In the target state the portal validates these fields before accepting submission.

## Why it matters
Data quality from this upstream party is the root cause of PP-BGID-001 and PP-BGID-003. Incomplete or malformed applications stall intake and delay every downstream step.

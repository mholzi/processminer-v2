---
id: PP-PR-001
type: pain-point
section: pain-points
title: No system of record
status: draft
confidence: medium
source: periodic-kyc-review-dtp.pdf
category: data fragmentation
severity: HIGH
priority: P1
affects: [PS-PR-002, PS-PR-003, PS-PR-005]
---
## Description
Evidence for a periodic review lives in four separate systems — shared drive, email, SharePoint, and core banking. There is no single authoritative case record; analysts must manually pull and reconcile artefacts from each system before they can assess or sign off a review.

## Impact
Manual reconciliation across four systems consumes analyst time and makes the completeness of any evidence pack impossible to verify automatically. This is recorded as G-02 (Evidence scattered across 4 systems — Critical, target close Q1 2027).

## Root cause
The four systems serve different owners: RMs use a shared drive and email (As-Is Step 3), Compliance Ops records outcomes in a SharePoint log (Step 5), and next-review dates are held in core banking (Step 5). No purpose-built case management layer consolidates them.

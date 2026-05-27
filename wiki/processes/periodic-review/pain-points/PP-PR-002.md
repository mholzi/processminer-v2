---
id: PP-PR-002
type: pain-point
section: pain-points
title: No deterministic trigger
status: draft
confidence: medium
source: periodic-kyc-review-dtp.pdf
category: process control
severity: HIGH
priority: P1
affects: [PS-PR-001]
---
## Description
Reviews are initiated when a Relationship Manager notices a client is due, based on a monthly Excel extract from Compliance. There is no system-generated, deterministic trigger. A client whose RM leaves the bank drops off the list for a full review cycle.

## Impact
As of Q1 2026, 18.4% of High-risk reviews are overdue. Two regulatory findings have been raised: a BaFin §44 KWG inspection (Sep 2025) and internal audit report IA-2025-117. Reviews not triggered on time leave elevated-risk clients without current due diligence.

## Root cause
Accountability for initiating reviews sits with the RM rather than a central system. RM coverage lists are not reconciled against the client master, so owner changes when an RM leaves silently remove clients from the trigger population.

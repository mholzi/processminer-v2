---
id: PP-COB-003
type: pain-point
section: pain-points
title: KYC screening false positives
status: confirmed
confidence: high
source: DTP-BB-ONB-001 v2.3
category: SYSTEM
severity: MEDIUM
priority: P2
affects: [PS-COB-002]
---
## Description
The screening tool flags a large share of applications for manual review, most of which turn out to be harmless name matches.

## Impact
A 40% false-positive rate. KYC Analysts spend significant time clearing matches that were never real risks.

## Root cause
Screening thresholds are tuned conservatively and there is no learning loop to suppress repeat false matches.

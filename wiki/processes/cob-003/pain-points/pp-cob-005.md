---
id: PP-COB-005
type: pain-point
section: pain-points
title: Credit bureau delays
status: confirmed
confidence: high
source: DTP-BB-ONB-001 v2.3
category: SYSTEM
severity: LOW
priority: P3
affects: [PS-COB-003]
---
## Description
During credit assessment the external bureau response time varies and is not visible to the analyst, who simply waits.

## Impact
Unpredictable delays on the credit step, with no way to set client expectations.

## Root cause
The bureau integration is fire-and-forget — no SLA, no status polling, no timeout handling.

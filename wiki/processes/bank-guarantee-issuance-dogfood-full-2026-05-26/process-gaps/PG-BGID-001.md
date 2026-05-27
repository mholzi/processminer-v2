---
id: PG-BGID-001
type: process-gap
section: process-gaps
title: End-to-End SLA Mismatch — Zero Buffer and No Tracking
status: draft
confidence: medium
source: SME interview — process-specialist session 2026-05-26
area: process design
gapStatus: open
affects: [PP-BGID-001, PP-BGID-002, FP-BGID-001, FP-BGID-002, M-BGID-001]
updatedBy: admin
updatedAt: 2026-05-26T09:42:26Z
approval: in-progress
approvalBy: admin
approvalDate: 2026-05-26
---
## The gap
The bank commits a five-business-day headline SLA to clients, but the internal sub-SLAs — intake one day, Legal review two days, approval one day, generation and delivery one day — sum to exactly five days with no buffer. No end-to-end elapsed-time metric is tracked.

## Impact
Any single step overrunning its sub-SLA breaks the headline client commitment. Because no end-to-end elapsed-time KPI is measured (M-BGID-001 is defined but not instrumented), the desk cannot distinguish structural SLA risk from one-off delays or target specific steps for improvement.

## Next step
Instrument end-to-end elapsed time from application receipt (PS-BGID-001) to MT760 delivery (PS-BGID-006); introduce a sub-SLA buffer allocation per step and assign SLA-tracking ownership to the Head of Trade Finance.

---
id: ASM-BGID-004
type: assumption
section: assumptions
title: Credit System Exposes a Real-Time API for Facility Utilisation Data
status: draft
confidence: high
source: SME interview — transformation-agent session 2026-05-26
assumptionStatus: OPEN
bearsOn: [TD-BGID-004, TS-BGID-002]
updatedBy: admin
updatedAt: 2026-05-26T09:28:32Z
---
## The assumption
The bank's credit and facility management system exposes a real-time or near-real-time API for facility utilisation and available headroom data that can be consumed by the Corporate Portal without a major middleware or data-warehouse build.

## Why it is unconfirmed
The credit system's API capability and data model have not been assessed; the IT Architect has not yet confirmed whether a real-time facility feed is technically feasible within the target programme timeline and budget.

## Impact if wrong
Without a real-time API, the headroom widget requires batch refresh — reducing its utility for same-day applications and potentially misleading clients whose limit changes intraday; TS-BGID-002's stall-prevention benefit is materially weakened.

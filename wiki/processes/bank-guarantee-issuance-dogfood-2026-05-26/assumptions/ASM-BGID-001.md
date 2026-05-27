---
id: ASM-BGID-001
type: assumption
section: assumptions
title: TFS can expose real-time facility utilisation via API without full system upgrade
status: draft
confidence: low
source: wiki-synthesis-2026-05-26
assumptionStatus: OPEN
bearsOn: [TD-BGID-001]
updatedBy: admin
updatedAt: 2026-05-26T20:15:01Z
---
## The assumption
The Trade Finance System can be enhanced to expose real-time facility utilisation via an API callable by the Corporate Portal at submission time, without a full version upgrade or core system replacement.

## Why it is unconfirmed
The TFS integration architecture has not been formally assessed for a synchronous low-latency API. Existing integrations are batch or event-based; a real-time facility check at portal submission may require unscoped architectural work.

## Impact if wrong
If TFS cannot expose a real-time API, the automated facility check falls back to the manual step and the fast-lane target state cannot be delivered without a larger system investment.

---
id: REQ-BGIT-002
type: requirement
section: requirements
title: Corporate Portal displays real-time credit headroom before application submission
status: draft
confidence: low
source: source-target — bank-guarantee-issuance-test wiki
reqType: FUNCTIONAL
moscow: MUST
derivedFrom: [TD-BGIT-002]
addresses: [PP-BGIT-001, PG-BGIT-001]
---
## Requirement
The Corporate Portal must display the client's current facility utilisation and available credit headroom — sourced from a real-time TFS query — at the point of application submission, before the client confirms and submits the guarantee request.

## Rationale
Without real-time credit data at submission, clients cannot self-assess whether their application will trigger a Credit team referral; the advisory value of the pre-check depends entirely on data timeliness.

## Acceptance criteria
- Portal credit headroom data is sourced from a live TFS query, not a cached or batch-refreshed value
- The displayed headroom refreshes automatically when the application amount field changes
- Clients who submit despite an insufficient-headroom indication are tracked for Credit team SLA monitoring

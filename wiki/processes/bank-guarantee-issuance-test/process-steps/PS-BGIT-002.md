---
id: PS-BGIT-002
type: process-step
section: process-steps
title: Credit and Facility Check
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
owner: Trade Finance Officer
systems: [SYS-BGIT-002]
approval: in-progress
sla: Credit team response: informal 1–2 business days; no formal SLA — see PG-BGIT-001
---
## What happens
The Trade Finance Officer reviews the application against the client's facility record; the Trade Finance System blocks issuance if the guarantee amount exceeds the available limit. If insufficient, the application is parked and routed to the Credit team, which may grant a temporary uplift, recommend a permanent facility increase (separate process), or decline — triggering formal rejection via the portal.

No proactive client notification is sent while parked at credit (FP-BGIT-002), and there is no formal Credit team response SLA (PG-BGIT-001).

## Inputs
- Complete application from Step 1
- Client's guarantee facility record in Trade Finance System
- Available facility limit

## Outputs
- Confirmed adequate facility limit → application proceeds to wording review
- Or: application parked and routed to Credit team for limit decision (temporary uplift / permanent facility increase / decline)
- On Credit team decline: formal rejection issued to client via Corporate Portal

## Why it matters
Prevents issuance against facilities with insufficient credit headroom, protecting the bank's risk limits.

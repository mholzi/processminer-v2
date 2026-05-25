---
id: II-BGIT-005
type: innovation-idea
section: innovation-ideas
title: Live SLA countdown and proactive stall notification for in-flight applications
status: draft
confidence: medium
source: SME interview — M. Berger, 2026-05-20
category: customer experience
strategicFit: HIGH
complexity: LOW
addresses: [FP-BGIT-001, FP-BGIT-002, PP-BGIT-001]
provenance: {"Expected benefit": {"evidence": "", "source": "proposed"}, "Feasibility": {"evidence": "", "source": "proposed"}, "The idea": {"evidence": "", "source": "proposed"}}
relevance: relevant
relevanceBy: m.berger
relevanceDate: 2026-05-20
---
## The idea
Add a live SLA countdown to the Corporate Portal showing days remaining against the 3-business-day target, and trigger an automated notification — email and portal alert — whenever an application is parked at credit review, stating the reason and the expected next step.

## Expected benefit
Eliminates the avoidable RM call volume and client anxiety documented in FP-BGIT-001 and FP-BGIT-002. Clients remain informed without polling or calling in, reducing trust erosion during the most common source of delay.

## Feasibility
LOW complexity. The portal SLA timer requires a real-time TFS status read already available; the stall notification requires an event subscription on the TFS status-change field. No process redesign — pure portal UI and notification engine work.

---
id: FP-BGIT-002
type: friction-point
section: friction-points
title: No proactive notification when application is parked at credit review
status: draft
confidence: high
source: client-journey-specialist — M. Berger, 2026-05-20
severity: HIGH
occursAt: [PS-BGIT-002]
painPoint: [PP-BGIT-001]
provenance: {"Client impact": {"evidence": "M. Berger: credit limit stalls are 'the most common reason for delay' — clients discover stall by polling or RM call", "source": "elicited"}, "Description": {"evidence": "M. Berger: 'no proactive notification when application is parked at credit' — confirmed as friction point", "source": "elicited"}, "Root cause": {"evidence": "M. Berger: no automated notification triggered when TFO parks application for Credit review", "source": "elicited"}}
---
## Description
When an application is parked at Step 2 awaiting a Credit team limit review, the client receives no notification. The portal status may remain unchanged for days with no explanation.

## Root cause
No automated notification is triggered when the TFO parks an application for Credit review; the system relies on the client or RM to notice the stall through manual portal polling.

## Client impact
The client discovers the stall either by polling the portal repeatedly or by learning via the RM after calling in — both paths add effort and erode trust. PP-BGIT-001 documents this as the leading source of delay.

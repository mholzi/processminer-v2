---
id: TS-BGID-002
type: target-state
section: to-be-design
title: Facility Headroom Self-Serve — Client Pre-Qualifies Before Submission
status: draft
confidence: high
source: SME interview — transformation-agent session 2026-05-26
replaces: [PS-BGID-002]
systems: [SYS-BGID-002]
provenance: {"Rationale": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}, "Target description": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}, "What changes": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}}
updatedBy: admin
updatedAt: 2026-05-26T09:27:02Z
---
## Target description
The Corporate Portal exposes a real-time facility headroom indicator drawn from the live credit system, visible to the client before they begin the application form. Applications within confirmed facility limits are auto-cleared by the TFS; applications in shortfall are routed to the Credit team with a pre-calculated shortfall amount, replacing the manual stall with a structured credit escalation.

## What changes
- A real-time facility headroom widget is displayed on the guarantee application screen before the client enters application details
- Applications within the confirmed facility limit are auto-cleared by the Trade Finance System without TFO intervention
- Applications in shortfall are routed to the Credit team with the pre-calculated shortfall amount attached
- The client receives a transparent shortfall notification rather than an unexplained application stall

## Rationale
Surfacing headroom before submission shifts pre-qualification effort to the client self-serve channel, eliminating the most common application-stall scenario at its root cause and removing a manual TFO step from the critical path for standard in-limit applications.

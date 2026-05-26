---
id: TD-BGID-004
type: transformation-decision
section: transformation-decisions
title: Real-Time Facility Headroom Dashboard for Client Self-Serve Pre-Qualification
status: draft
confidence: high
source: SME interview — transformation-agent session 2026-05-26
decisionType: self-service capability
decisionStatus: agreed
resolves: [PP-BGID-001]
realises: [TS-BGID-002]
fromIdea: [II-BGID-003]
provenance: {"Options considered": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}, "Rationale": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}, "The decision": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}}
updatedBy: admin
updatedAt: 2026-05-26T09:27:02Z
---
## The decision
The Corporate Portal will expose a real-time facility headroom indicator — drawn from the live credit and facility system — to corporate clients before and during guarantee application entry, so clients self-serve pre-qualification before investing effort in an application that will stall.

## Options considered
- **Real-time portal dashboard** — chosen: client self-service; eliminates a class of stalled applications; reduces Credit team escalations
- **RM-communicated headroom** — relies on RM knowledge and availability; does not scale; does not resolve the systematic stall problem (PP-BGID-001)
- **Post-submission credit check warning** — automated warning at submission time if headroom is insufficient; addresses the stall but after the client has already invested application effort
- **Status quo** — facility shortfall is the most common stall scenario; accepted risk is not defensible given the volume

## Rationale
Surfacing headroom before application entry shifts pre-qualification to the self-serve channel and resolves PP-BGID-001 at root cause; the post-submission warning option was rejected because it imposes rework effort on a client who has already completed the form.

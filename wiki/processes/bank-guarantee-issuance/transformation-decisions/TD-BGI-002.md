---
id: TD-BGI-002
type: transformation-decision
section: transformation-decisions
title: Implement Proactive Facility Headroom Monitoring and Alerts
status: draft
confidence: low
resolves: [PP-BGI-001]
realises: [TS-BGI-002]
fromIdea: [II-BGI-004]
provenance: {"Options considered": {"evidence": "", "source": "proposed"}, "Rationale": {"evidence": "", "source": "proposed"}, "The decision": {"evidence": "", "source": "proposed"}}
decisionType: configuration
decisionStatus: proposed
---
## The decision
Configure automated threshold-based monitoring of guarantee facility utilisation in the Trade Finance System, with alerts routed to the relationship manager and client when available headroom falls below a configurable threshold.

## Options considered
- Automated headroom monitoring and client/RM alerting via TFS threshold configuration
- Monthly utilisation report distributed manually to relationship managers
- Credit team proactive outreach programme for near-limit clients

## Rationale
Automated threshold alerting requires no core system rebuild and directly addresses the reactive nature of PP-BGI-001. Manual reports and outreach depend on human initiation and cannot match the reliability of automated threshold detection.

---
id: ADR-BGID-009
type: adr
section: architecture-decisions
title: Capture MT760 Acknowledgement via TFS SWIFT Adapter and Route to Client
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
adrStatus: ACCEPTED
owner: Domain Architect
domain: Trade Finance
decision: [TD-BGID-001]
provenance: {"Alternatives considered": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Consequences": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Context": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Decision": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T14:59:49Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Context
Clients currently receive no confirmation when the beneficiary's bank acknowledges the MT760 guarantee, which is the friction point FP-BGID-004. The SWIFT acknowledgement arrives inbound to the bank's SWIFT Alliance connection; the architecture must decide how to capture it and deliver a notification to the client.

## Decision
Configure the Finastra TIS SWIFT adapter to capture inbound MT760 acknowledgements and publish an mt760-acknowledged domain event. The notification capability subscribes and delivers via portal push notification or ICC-SWIFT API callback depending on the client's channel.

## Alternatives considered
- **Manual TFO relay** — rejected: this is the As-Is state and the documented friction point FP-BGID-004; eliminates no operational step
- **Direct SWIFT-to-client push (proprietary)** — rejected: requires each corporate client to maintain a SWIFT address for inbound messages; not viable for SME-segment corporates
- **Poll SWIFT network for acknowledgement status** — rejected: polling introduces session overhead and latency; event-based capture is the correct pattern for an inbound SWIFT message

## Consequences
- Finastra TIS SWIFT adapter configuration must be extended to handle inbound MT760 acknowledgement messages
- Notification capability must support both portal push and ICC-SWIFT API callback delivery modes
- New mt760-acknowledged event class added to the domain event schema
- End-to-end acknowledgement-to-notification latency must be monitored as an operational SLA

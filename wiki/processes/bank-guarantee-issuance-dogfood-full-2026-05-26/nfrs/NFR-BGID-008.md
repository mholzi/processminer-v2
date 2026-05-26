---
id: NFR-BGID-008
type: nfr
section: nfrs
title: Scalability: Sustain 1 050 Guarantee Applications per Month
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
category: SCALABILITY
target: TFS Intake Subscriber and Application Event Publisher sustain 1 050 applications/month (3× baseline of 350) via horizontal scaling without re-architecture
owner: Head of Trade Finance Engineering
appliesTo: [TGTAPP-BGID-001, TGTAPP-BGID-005]
drivenByADR: [ADR-BGID-012]
provenance: {"Definition": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Measurement": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Verification": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Definition
The TFS Intake Subscriber and Application Event Publisher must sustain a throughput of 1 050 guarantee applications per month — 3× the current monthly baseline of 350 — without re-architecture, relying solely on horizontal pod autoscaling within the defined HPA ceiling.

## Measurement
Monthly peak throughput monitored via Kafka producer and consumer metrics (messages per hour). HPA scale-out events reported in the capacity dashboard; sustained operation at HPA ceiling triggers a capacity review.

## Verification
Load test in staging at 1 050 applications per month sustained over a 4-hour run. Both components must scale horizontally within HPA limits and process all events with zero message loss. Validated before Phase 1 go-live.

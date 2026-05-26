---
id: ADR-BGID-004
type: adr
section: architecture-decisions
title: Event-Driven Intake with Application-Received Domain Event
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
adrStatus: ACCEPTED
owner: Domain Architect
domain: IT Architecture
provenance: {"Alternatives considered": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Consequences": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Context": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Decision": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T14:59:49Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Context
Multiple downstream capabilities — wording classification, facility check, sanctions screening, and client notification — need to respond when a new application enters the process. The architecture must decide whether these capabilities are invoked synchronously by a central orchestrator or subscribe independently to a domain event published at the completion of intake validation.

## Decision
Publish an application-received domain event at the close of the intake validation capability. All downstream capabilities subscribe via the bank's message bus rather than being called synchronously by the intake service or TFS workflow engine.

## Alternatives considered
- **Synchronous orchestration from the intake service** — rejected: tight coupling; a single downstream failure blocks the intake response path; harder to evolve capabilities independently
- **TFS workflow engine as synchronous orchestrator** — rejected: makes TFS the owner of capabilities it should not orchestrate; ties capability evolution to Finastra's release cadence
- **Polling from downstream services** — rejected: higher latency and wasted compute; no clean start-of-processing signal for SLA tracking

## Consequences
- Requires a message broker (to be specified by the Solution Architect)
- Loose coupling enables independent capability scaling and deployment
- Event replay supports the audit trail capability
- Demands disciplined event schema versioning and backward-compatibility policy

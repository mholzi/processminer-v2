---
id: COMP-BGID-002
type: component
section: components
title: TFS Wording Orchestrator
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
tech: Java 21 / Spring Boot 3.2 / Finastra TI workflow state machine
dataStore: PostgreSQL 16
hosting: Finastra on-prem cluster, EU data centre
scaling: Active-passive HA
inApp: [TGTAPP-BGID-001]
realisesCapability: [CAP-BGID-002, CAP-BGID-003]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Responsibility
Orchestrates the guarantee wording workflow within TFS. Calls the AI Wording Pre-Screener synchronously, routes standard applications onward, manages the five-business-day Legal SLA timer for bespoke cases, and publishes wording-decision notification events.

## Technical detail
Java 21, Spring Boot 3.2 with Finastra TI native workflow state machine. Wording state and SLA timestamps in PostgreSQL 16. Calls POST /v1/classify (INT-BGID-002) with Resilience4j circuit breaker (3-failure threshold). SLA timer via scheduled task polling workflow state every 15 minutes. Finastra on-prem cluster, EU data centre.

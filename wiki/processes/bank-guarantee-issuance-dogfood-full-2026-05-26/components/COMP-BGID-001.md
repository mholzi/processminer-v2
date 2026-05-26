---
id: COMP-BGID-001
type: component
section: components
title: TFS Intake Subscriber
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
tech: Java 21 / Spring Boot 3.2 / Spring Kafka
dataStore: PostgreSQL 16
hosting: Finastra on-prem cluster, EU data centre
scaling: Kafka consumer group bgid-tfs-intake · 3 active consumers
inApp: [TGTAPP-BGID-001]
realisesCapability: [CAP-BGID-001, CAP-BGID-006, CAP-BGID-008]
provenance: {"Responsibility": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Technical detail": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Responsibility
Subscribes to bgid.application.received.v1. Validates the event schema, creates the canonical application record in TFS, and manages the end-to-end workflow — including the four-eyes approval gate and treasury collateral event handling. Records all processing events to the lifecycle event topic.

## Technical detail
Java 21, Spring Boot 3.2, Spring Kafka consumer group bgid-tfs-intake (3 replicas). Application records in PostgreSQL 16 via PgBouncer connection pool. Offset committed after successful DB write; schema deserialization failure routes to dead-letter topic. Hosted on Finastra on-prem cluster, EU data centre.

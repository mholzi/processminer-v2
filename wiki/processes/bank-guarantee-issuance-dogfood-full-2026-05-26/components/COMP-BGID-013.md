---
id: COMP-BGID-013
type: component
section: components
title: Lifecycle Event Sink
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
tech: Java 21 / Spring Boot 3.2 / Spring Kafka
dataStore: WORM Object Store — S3 Object Lock, governance mode, 10-year retention
hosting: EKS eu-central-1
scaling: HPA 2→4 replicas on Kafka consumer lag
inApp: [TGTAPP-BGID-006]
realisesCapability: [CAP-BGID-009]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Responsibility
Subscribes to bgid.lifecycle.events.v1 and writes each guarantee lifecycle event to WORM-compliant object storage with a 10-year retention lock. Monitors consumer lag; PagerDuty P1 alert triggered if any event remains unarchived for more than 24 hours.

## Technical detail
Java 21, Spring Boot 3.2, Spring Kafka (consumer group bgid-dms-lifecycle). Writes to S3-compatible WORM store (Object Lock, governance mode, 10-year retention). Object key: {guaranteeId}/{eventType}/{ISO-8601-timestamp}.json. Archive P95 target < 30s. DLQ depth > 0 triggers PagerDuty P1. EKS eu-central-1, HPA 2→4.

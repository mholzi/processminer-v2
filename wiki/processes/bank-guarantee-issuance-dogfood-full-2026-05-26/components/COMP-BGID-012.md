---
id: COMP-BGID-012
type: component
section: components
title: Application Event Publisher
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
tech: Java 21 / Spring Boot 3.2 / Apache Kafka
dataStore: PostgreSQL 16 (transactional outbox for exactly-once delivery)
hosting: EKS eu-central-1
scaling: HPA 2→6 replicas
inApp: [TGTAPP-BGID-005]
dependsOn: [COMP-BGID-010, COMP-BGID-011]
realisesCapability: [CAP-BGID-001]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Responsibility
Receives validated application data from both the Portal Web App and the ICC-SWIFT API Endpoint Service, then publishes an application-received domain event to Kafka using the transactional outbox pattern to guarantee exactly-once delivery to the TFS Intake Subscriber.

## Technical detail
Java 21, Spring Boot 3.2, Apache Kafka producer. Transactional outbox in PostgreSQL 16 (application_outbox table); Debezium CDC connector polls every 1s. Kafka idempotent producer + transactional API for exactly-once semantics. Partition key: applicationId. Topic: bgid.application.received.v1. EKS eu-central-1, HPA 2→6.

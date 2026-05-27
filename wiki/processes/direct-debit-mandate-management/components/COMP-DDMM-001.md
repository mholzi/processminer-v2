---
id: COMP-DDMM-001
type: component
section: components
title: Mandate Validation Service
status: draft
confidence: high
source: M. Berger (test) (Test Lead)
tech: Spring Boot 3
dataStore: Postgres 16
hosting: EKS · eu-frankfurt
scaling: HPA · 2 → 8 replicas
inApp: [TGTAPP-DDMM-001]
realisesCapability: [CAP-DDMM-001]
updatedBy: the assistant
updatedAt: 2026-05-24T06:48:16Z
---
## Responsibility
Validates incoming mandate requests within Mandate Hub: checks the debtor IBAN format and reachability, screens the creditor against the SEPA creditor registry, runs duplicate detection against the active-mandate Postgres table, and on success emits the canonical `mandate-created` event onto the outbound Kafka topic.

## Technical detail
Spring Boot 3 microservice with an owned `mandates` table on Postgres 16 (RDS, eu-frankfurt). Publishes `mandate-created` events via an outbox pattern on the Kafka topic for at-least-once delivery guarantees. Deployed on EKS in eu-frankfurt, horizontally scaled via HPA (2 → 8 replicas).

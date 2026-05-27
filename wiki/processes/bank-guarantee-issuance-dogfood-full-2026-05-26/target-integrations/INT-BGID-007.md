---
id: INT-BGID-007
type: target-integration
section: target-integrations
title: TFS → DMS: Guarantee Lifecycle Event Archival
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
pattern: ASYNC
direction: DOWNSTREAM
contract: AsyncAPI 2.6 — Kafka topic bgid.lifecycle.events.v1
volume: ~2 000 events/month (~6 events/guarantee) · archive P95 ≤ 30s
from: [TGTAPP-BGID-001]
to: [TGTAPP-BGID-006]
realises: [CAP-BGID-009]
drivenByADR: [ADR-BGID-011]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Purpose
The TFS publishes every guarantee lifecycle event — intake, wording decision, screening result, approval, issuance, MT760 acknowledgement, collateral confirmation — to a Kafka topic. The DMS Lifecycle Event Sink consumes and writes each event to WORM storage, satisfying the 10-year AML and MaRisk BTO record-keeping obligation.

## Contract details
AsyncAPI 2.6, Kafka topic bgid.lifecycle.events.v1. Envelope: eventType (enum), eventAt (ISO-8601), applicationId, guaranteeId, actorId, type-specific payload. WORM object key: {guaranteeId}/{eventType}/{eventAt}. Schema evolution additive-only; consumer version-tolerant. Kafka retention 30 days. applicationId as partition key for event ordering.

## Failure mode
Consumer failure leaves events in the Kafka topic for up to 30 days. DLQ on consumer error; compliance team alerted if any event remains unarchived for > 24h. Loss of any lifecycle event is treated as a P1 regulatory compliance incident.

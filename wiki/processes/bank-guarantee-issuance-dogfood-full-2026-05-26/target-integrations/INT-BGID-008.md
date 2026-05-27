---
id: INT-BGID-008
type: target-integration
section: target-integrations
title: TFS → Portal: Client Notification Events
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
pattern: EVENT
direction: DOWNSTREAM
contract: AsyncAPI 2.6 — Kafka topic bgid.notifications.v1
volume: ~1 400 events/month (~4 notifications/guarantee avg)
from: [TGTAPP-BGID-001]
to: [TGTAPP-BGID-005]
realises: [CAP-BGID-007, CAP-BGID-008]
drivenByADR: [ADR-BGID-009]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Purpose
The TFS publishes client notification events — wording classification outcome, collateral confirmation, issuance confirmation, and MT760 beneficiary-bank acknowledgement — to a Kafka topic. The Portal notification service subscribes and delivers these via portal push or ICC-SWIFT API callback depending on the client's registered channel.

## Contract details
AsyncAPI 2.6, Kafka topic bgid.notifications.v1. Fields: notificationType (WORDING_DECIDED | COLLATERAL_CONFIRMED | GUARANTEE_ISSUED | MT760_ACKNOWLEDGED), applicationId, clientPartyId, channel (PORTAL | API), type-specific payload. Idempotency key: applicationId + notificationType. Producer authenticated via mTLS.

## Failure mode
Events buffered in topic for 7 days on Portal consumer lag. API callbacks retried 3× with exponential backoff, then placed in bgid.notifications.dlq with client service team alert. Portal session shows notification-pending badge during delivery delay.

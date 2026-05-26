---
id: INT-BGID-001
type: target-integration
section: target-integrations
title: Portal → TFS: Application-Received Event
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
pattern: EVENT
direction: DOWNSTREAM
contract: AsyncAPI 2.6 — Kafka topic bgid.application.received.v1
volume: ~350 events/month growing to 1 050/month at 3× scale
from: [TGTAPP-BGID-005]
to: [TGTAPP-BGID-001]
realises: [CAP-BGID-001]
drivenByADR: [ADR-BGID-004]
provenance: {"Contract details": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Failure mode": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Purpose": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
---
## Purpose
The Portal publishes an application-received domain event when a validated guarantee application clears mandatory field enforcement. The TFS subscribes to this event to create the canonical application record and initiate downstream processing. No direct REST call from Portal to TFS — ADR-BGID-004 commits the bank to event-driven intake.

## Contract details
AsyncAPI 2.6, Kafka topic bgid.application.received.v1. Payload: applicationId, clientPartyId, guaranteeType, amount, currency, wordingText, commercialContractRef, submissionChannel, submittedAt. Idempotency key: applicationId. Portal authenticates to Kafka via mTLS, corporate IAM certificate. Schema evolution additive-only. Dead-letter topic bgid.application.dlq for unparseable messages.

## Failure mode
TFS consumer lag is monitored; unprocessed events held in the topic for 7 days. If TFS is offline, the Portal continues accepting and publishing — no client-visible degradation. Dead-letter on deserialization failure triggers on-call alert.

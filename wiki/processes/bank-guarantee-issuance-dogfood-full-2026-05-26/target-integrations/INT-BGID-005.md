---
id: INT-BGID-005
type: target-integration
section: target-integrations
title: TFS → Murex: Post-Issuance Facility Utilisation Write
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
pattern: ASYNC
direction: DOWNSTREAM
contract: AsyncAPI 2.6 — Kafka topic bgid.facility.utilisation.v1
volume: ~350 events/month · utilisation visible in Murex within 1 BD
from: [TGTAPP-BGID-001]
to: [TGTAPP-BGID-004]
realises: [CAP-BGID-005]
drivenByADR: [ADR-BGID-007]
provenance: {"Contract details": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Failure mode": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Purpose": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
---
## Purpose
After guarantee issuance, the TFS publishes a facility-utilisation event to update the corporate client's facility record in Murex MX.3. This non-blocking async write keeps Murex as the authoritative facility record without delaying the issuance critical path (ADR-BGID-007).

## Contract details
AsyncAPI 2.6, Kafka topic bgid.facility.utilisation.v1. Payload: applicationId, partyId, issuedAmount, currency, issuanceDate, guaranteeId. Idempotency: Murex consumer checks applicationId against a deduplication table before writing. Retries up to 3× with exponential backoff; failed events placed in bgid.facility.dlq.

## Failure mode
Failed utilisation writes land in bgid.facility.dlq. Operations team alerted on DLQ depth > 10 messages. A brief utilisation staleness window exists (documented in EX-BGID-006); manual reconciliation procedure covers persistent failures.

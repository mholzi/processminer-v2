---
id: INT-BGID-004
type: target-integration
section: target-integrations
title: TFS → Murex: Authoritative Facility Limit Check
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
pattern: SYNC
direction: BIDIRECTIONAL
contract: OpenAPI 3.1 REST — POST /v1/facility/check
volume: ~350 req/month · P95 ≤ 500ms
from: [TGTAPP-BGID-001]
to: [TGTAPP-BGID-004]
realises: [CAP-BGID-005]
drivenByADR: [ADR-BGID-007]
provenance: {"Contract details": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Failure mode": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Purpose": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
---
## Purpose
The TFS performs the authoritative facility limit check against Murex MX.3 at application processing time. Murex returns whether the requested guarantee amount falls within the approved credit facility; TFS routes the application to auto-clear or Credit team escalation with the pre-calculated shortfall amount.

## Contract details
OpenAPI 3.1 REST, POST /v1/facility/check. Request: partyId, guaranteeAmount, currency, applicationId. Response: checkResult (CLEAR | SHORTFALL), shortfallAmount (nullable), facilitySnapshot (limit, utilisation, asOf). Auth: OAuth 2.0 client credentials via corporate IAM. Timeout 2s; no retry on timeout. TLS 1.3, EU endpoints only.

## Failure mode
If Murex times out or returns 5xx, TFS routes the application to the Credit team escalation queue flagged for manual review. No application is auto-cleared without a successful Murex response.

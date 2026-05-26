---
id: INT-BGID-002
type: target-integration
section: target-integrations
title: TFS → AI Wording Pre-Screener: Wording Classification Call
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
pattern: SYNC
direction: BIDIRECTIONAL
contract: OpenAPI 3.1 REST — POST /v1/classify
volume: ~350 req/month · P95 ≤ 800ms
from: [TGTAPP-BGID-001]
to: [TGTAPP-BGID-002]
realises: [CAP-BGID-002, CAP-BGID-003]
drivenByADR: [ADR-BGID-002]
provenance: {"Contract details": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Failure mode": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Purpose": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
---
## Purpose
The TFS calls the AI Wording Pre-Screener with guarantee wording text and guarantee type. The screener returns a classification decision (standard or bespoke), a matched template ID for standard cases, and a confidence score. Bespoke cases are routed to Legal review; standard cases advance automatically to the credit and facility check.

## Contract details
OpenAPI 3.1 REST, POST /v1/classify. Request: wordingText (string), guaranteeType (enum), applicationId (UUID). Response: classification (standard | bespoke), templateId (nullable), confidenceScore (float 0.0–1.0), humanReviewRequired (boolean). Auth: OAuth 2.0 bearer via corporate IAM. Timeout 3s; exponential backoff on 5xx. Schema versioned via URI path.

## Failure mode
If the screener is unreachable or returns 5xx, the TFS routes the application to the TFO manual review queue as fallback. Circuit breaker opens after 3 consecutive failures; manual review queue absorbs all new applications during the open-circuit state.

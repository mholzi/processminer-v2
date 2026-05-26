---
id: INT-BGID-003
type: target-integration
section: target-integrations
title: Portal → Murex: Facility Headroom Read
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
pattern: SYNC
direction: BIDIRECTIONAL
contract: OpenAPI 3.1 REST — GET /v1/facility/headroom
volume: ~10k req/month · P95 ≤ 1s
from: [TGTAPP-BGID-005]
to: [TGTAPP-BGID-004]
realises: [CAP-BGID-005]
drivenByADR: [ADR-BGID-007]
provenance: {"Contract details": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Failure mode": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Purpose": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
---
## Purpose
The Corporate Portal queries Murex MX.3 for the real-time facility headroom available to a corporate client before they begin the guarantee application form. Murex returns the approved facility limit, current utilisation, and available headroom, which the portal renders in the self-serve headroom widget.

## Contract details
OpenAPI 3.1 REST, GET /v1/facility/headroom. Parameters: partyId, currency, requestedAmount. Response: facilityLimit, currentUtilisation, availableHeadroom, currency, asOf timestamp. Auth: OAuth 2.0 client credentials. Cache-Control: no-store — headroom is never cached. TLS 1.3; EU-hosted Murex endpoint only (ADR-BGID-010).

## Failure mode
If Murex is unreachable, the portal renders a headroom-data-unavailable notice and allows the application to continue. The authoritative facility limit check in TFS runs regardless, providing a backstop against facility overrun.

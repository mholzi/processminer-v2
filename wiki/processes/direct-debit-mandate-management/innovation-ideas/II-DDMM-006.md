---
id: II-DDMM-006
type: innovation-idea
section: innovation-ideas
title: Event-Driven MMS to Payment Hub Integration
status: draft
confidence: high
source: ddmm-innovation-analyst
category: System Integration
strategicFit: MEDIUM
complexity: HIGH
addresses: [PP-DDMM-003]
fromTrend: [TR-DDMM-002]
provenance: {"Expected benefit": {"evidence": "SME confirmed: eliminates reconciliation rework; makes CP-DDMM-004 an exception-only check; collections reference most current mandate data.", "source": "elicited"}, "Feasibility": {"evidence": "SME confirmed: high complexity — architectural change to INT-DDMM-005; phased rollout (near-real-time batch first, event-driven second) reduces delivery risk.", "source": "elicited"}, "The idea": {"evidence": "SME (M. Vogel) confirmed: PP-DDMM-003 stems from intraday batch sync creating a divergence window; event-driven integration is the structural fix.", "source": "elicited"}}
---
## The idea
Replace the intraday batch sync from MMS to the Payment Hub with an event-driven integration that publishes each mandate change — registration, amendment, cancellation — as it is committed to MMS. The Payment Hub mandate store is updated in near-real time, eliminating the divergence window.

## Expected benefit
Eliminates the daily reconciliation rework and makes CP-DDMM-004 an exception-only check rather than a daily necessity. Collections reference the most current mandate data from the moment of registration, not the next batch run.

## Feasibility
High complexity — architectural change to the existing MMS-to-Payment Hub integration. Both systems must support event-driven messaging. Introduces new failure modes absent from batch. A phased approach — near-real-time short-interval batch first, event-driven second — reduces delivery risk.

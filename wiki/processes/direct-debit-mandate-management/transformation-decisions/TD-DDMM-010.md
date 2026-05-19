---
id: TD-DDMM-010
type: transformation-decision
section: transformation-decisions
title: Shorten MMS to Payment Hub Batch Sync Interval and Defer Event-Driven Integration
status: draft
confidence: high
source: ddmm-transformation-agent
decisionType: TECHNOLOGY
decisionStatus: DECIDED
resolves: [PP-DDMM-003]
realises: []
fromIdea: [II-DDMM-006]
provenance: {"Options considered": {"evidence": "SME confirmed options and rationale — accepted without edit.", "source": "elicited"}, "Rationale": {"evidence": "SME confirmed rationale — accepted without edit.", "source": "elicited"}, "The decision": {"evidence": "SME (M. Vogel) accepted all ten decisions without edit; confirmed TD-10 correctly records the interim batch-interval reduction with II-DDMM-006 explicitly deferred for the IR-DDMM-006 reason.", "source": "elicited"}}
---
## The decision
Reduce the MMS-to-Payment-Hub intraday batch sync interval to materially cut mandate status lag; explicitly defer full event-driven integration (II-DDMM-006) to a future programme given its HIGH complexity and HIGH reliability risk (IR-DDMM-006).

## Options considered
- Implement event-driven MMS-to-Payment-Hub integration now (HIGH complexity, HIGH risk — deferred)
- Shorten batch sync interval as an interim measure (chosen)
- Accept current lag as tolerable given MEDIUM pain severity (no improvement)

## Rationale
Full event-driven integration delivers the best long-term outcome but IR-DDMM-006 is real: a poorly executed migration could worsen divergence rather than fix it, and retiring CP-DDMM-004 reconciliation prematurely removes the safety net. The interval reduction is lower risk, independently deliverable, and materially reduces PP-DDMM-003 lag while event-driven integration is assessed for a future programme.

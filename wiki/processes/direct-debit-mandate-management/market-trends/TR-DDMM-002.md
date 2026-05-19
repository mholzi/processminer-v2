---
id: TR-DDMM-002
type: market-trend
section: market-trends
title: Event-Driven Architecture and Real-Time Status APIs in Payments
status: draft
confidence: low
source: ddmm-innovation-analyst
horizon: near-term
asOf: 2026-05-19
sourceUrl: pending
bearsOn: [FP-DDMM-003, FP-DDMM-004, PP-DDMM-003]
provenance: {"Evidence": {"evidence": "SME accepted honest framing: figures are indicative only, sourceUrl: pending, require source-innovation verification.", "source": "elicited"}, "Relevance": {"evidence": "SME confirmed: FP-DDMM-003 (opaque status) is the daily creditor complaint; PP-DDMM-003 (reconciliation rework) is a systemic integration gap.", "source": "elicited"}, "The trend": {"evidence": "SME (M. Vogel) confirmed: DDMM relies on intraday batch sync to Payment Hub and binary portal status; event-driven integration addresses both the reconciliation burden and creditor opacity.", "source": "elicited"}}
---
## The trend
ISO 20022 adoption and the broader shift to API-first banking are driving European banks to replace batch integrations with event-driven architectures. Real-time status propagation across systems — and outbound to clients — is becoming a baseline expectation rather than a differentiator.

## Relevance
The DDMM process relies on an intraday batch sync to the Payment Hub and exposes only a binary pending / in-progress label to creditors. Event-driven integration would eliminate the reconciliation burden while enabling real-time creditor status feeds simultaneously.

## Evidence
SEPA Instant adoption and ISO 20022 migration are documented drivers of event-architecture investment in European banks; specific transaction volumes and API adoption rates here are indicative and require a source-innovation pass for verified figures.

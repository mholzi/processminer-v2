---
id: IR-DDMM-006
type: innovation-risk
section: innovation-risks
title: Event-Driven Integration Introduces Delivery and Reliability Failure Modes
status: draft
confidence: high
source: ddmm-innovation-analyst
severity: HIGH
affects: [II-DDMM-006]
---
## The risk
Replacing the intraday batch sync with event-driven MMS-to-Payment-Hub integration (II-DDMM-006) introduces failure modes — message loss, out-of-order delivery, idempotency failures — that the current batch model absorbs. If CP-DDMM-004 reconciliation is retired before event reliability is proven, the safety net is gone and divergence may go undetected.

## Likelihood & impact
Moderate likelihood during the cutover window if migration is treated as a hard cutover rather than a parallel-run. Impact is HIGH: MMS/Payment Hub divergence on mandate status directly affects whether collections are initiated against valid mandates — a compliance and operational risk.

## Mitigation
Run the event-driven path in parallel with the existing batch sync for a defined and proven period before cutover. Retain CP-DDMM-004 reconciliation in full until event reliability metrics meet agreed SLOs. Define divergence thresholds as explicit go/no-go gates for decommissioning the batch path.

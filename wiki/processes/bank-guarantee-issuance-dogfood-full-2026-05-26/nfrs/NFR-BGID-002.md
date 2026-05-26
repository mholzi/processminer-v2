---
id: NFR-BGID-002
type: nfr
section: nfrs
title: Wording Classification Inference P95 ≤ 800ms
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
category: PERFORMANCE
target: POST /v1/classify P95 response latency ≤ 800ms under ≤ 50 concurrent requests
owner: Head of Trade Finance Engineering
appliesTo: [TGTAPP-BGID-002]
drivenByADR: [ADR-BGID-002]
provenance: {"Definition": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Measurement": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Verification": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Definition
Measures the Classification Inference Service REST response latency from TFS classification request to classification response. P95 must be ≤ 800ms under normal operating load of ≤ 50 concurrent classification requests.

## Measurement
Measured via distributed tracing (OpenTelemetry) on the TFS → AI Wording Pre-Screener call. P95 latency reported in the APM dashboard (Grafana / Prometheus). Breach triggers horizontal pod autoscale alert.

## Verification
Load test with 50 concurrent classification requests over a 15-minute sustained run; must show P95 ≤ 800ms and zero 5xx responses. Validated in staging before Phase 2 go-live.

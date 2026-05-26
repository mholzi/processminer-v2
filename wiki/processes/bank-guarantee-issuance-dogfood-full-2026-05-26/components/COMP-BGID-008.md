---
id: COMP-BGID-008
type: component
section: components
title: Facility Headroom Read API
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
tech: Java 11 / Spring Boot 2.7
dataStore: Murex Oracle read-replica (read-only)
hosting: On-prem Murex infrastructure, EU data centre
scaling: Active-passive HA
inApp: [TGTAPP-BGID-004]
realisesCapability: [CAP-BGID-005]
provenance: {"Responsibility": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Technical detail": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Responsibility
Exposes the synchronous facility headroom endpoints — GET /v1/facility/headroom (portal widget) and POST /v1/facility/check (TFS limit check) — by reading facility utilisation and approved limits from the Murex Oracle operational database in real time.

## Technical detail
Java 11, Spring Boot 2.7 (Murex Professional Services build). Reads from Murex Oracle read-replica to avoid write contention. P95 latency target < 500ms; profiled under 350 concurrent requests. OAuth 2.0 client credentials, TLS 1.3. Active-passive HA on Murex on-prem cluster, EU data centre.

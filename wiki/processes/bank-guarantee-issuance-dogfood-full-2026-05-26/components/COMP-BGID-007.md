---
id: COMP-BGID-007
type: component
section: components
title: World-Check Screening Adapter
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
tech: Java 21 / Spring Boot 3.2
dataStore: None — stateless adapter
hosting: EKS eu-central-1 · CPU node pool
scaling: HPA 2→6 replicas on request rate
inApp: [TGTAPP-BGID-003]
realisesCapability: [CAP-BGID-004]
provenance: {"Responsibility": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Technical detail": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Responsibility
Provides the internal API surface for TFS-initiated sanctions screening calls. Translates TFS requests into World-Check One API v2 calls, maps the response to the internal ScreeningResult schema (CLEAR | FLAGGED | BLOCKED), and manages API key lifecycle via the corporate secret store.

## Technical detail
Java 21, Spring Boot 3.2. Stateless — no local database. World-Check One API v2 client (HTTPS, EU endpoint). API key from HashiCorp Vault, rotated every 90 days. Resilience4j circuit breaker with 10s timeout. EKS eu-central-1, CPU node pool, HPA 2→6 on request rate.

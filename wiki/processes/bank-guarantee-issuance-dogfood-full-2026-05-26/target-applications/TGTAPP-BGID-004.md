---
id: TGTAPP-BGID-004
type: target-application
section: target-applications
title: Facility & Credit System (Murex MX.3)
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
verdict: KEEP
vendor: Murex MX.3
owningDomain: Credit & Trade Finance
costBand: Existing licence — incremental API integration cost ~€50k–100k
drivenByADR: [ADR-BGID-007]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T14:59:49Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Rationale
Murex MX.3 holds the authoritative credit facility records used for the facility headroom check. Keeping it in place and exposing a synchronous read API avoids a facility-system migration out of scope for this transformation. The async write pattern for post-issuance utilisation updates limits the transformation's surface area on the Murex system.

## Tech stack
Murex MX.3 on-premises, EU data centre. New synchronous facility-read REST endpoint, async utilisation write via message queue. Integration built and tested with Murex Professional Services.

## Risks
- Murex MX.3 read API performance under load — synchronous facility read latency must be profiled before go-live
- Murex version compatibility — API endpoint stability across planned MX.3 upgrades must be contractually assured
- Async write window creates a brief utilisation staleness period (documented in process exception EX-BGID-006)

---
id: ADR-BGID-001
type: adr
section: architecture-decisions
title: Extend Finastra Trade Innovation TFS vs Greenfield Platform Build
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
adrStatus: ACCEPTED
owner: Domain Architect
domain: Trade Finance
decision: [TD-BGID-003]
resolvesGap: [VG-BGID-001]
provenance: {"Alternatives considered": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Consequences": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Context": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Decision": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T14:59:49Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Context
The bank operates Finastra Trade Innovation as its incumbent TFS, providing SWIFT MT760 generation, four-eyes workflow, and the core bank-guarantee processing record. The transformation adds mandatory intake enforcement, auto-routing, SWIFT acknowledgement capture, and Legal queue visibility. The architecture must decide whether to deliver these requirements by extending the incumbent or commissioning a new trade-finance platform.

## Decision
Extend Finastra Trade Innovation via its configuration layer and FusionFabric open-API layer. New capabilities are hosted in purpose-built services that integrate with TFS via API. The TFS workflow engine and SWIFT adapter are retained and reconfigured, not replaced.

## Alternatives considered
- **Greenfield in-house build** — rejected: 3+ year delivery timeline, high cost, loss of proven SWIFT connectivity and MaRisk-compliant workflow
- **Competing TF platform (Bolero, GT Nexus)** — rejected: significant licence and migration cost, loss of Finastra integrations, parallel-run risk during an active transformation
- **SaaS trade finance (Surecomp DOKA)** — rejected: EU data residency constraints and insufficient customisation ceiling for bespoke guarantee wording workflow

## Consequences
- Faster delivery by reusing proven SWIFT and workflow components
- Finastra upgrade cycle creates an ongoing compatibility dependency for all configured components
- Configuration complexity accumulates across transformation phases
- Vendor lock-in to Finastra for the core BG processing path

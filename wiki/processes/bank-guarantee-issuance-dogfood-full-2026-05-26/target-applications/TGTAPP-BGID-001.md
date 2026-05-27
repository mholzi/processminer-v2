---
id: TGTAPP-BGID-001
type: target-application
section: target-applications
title: Trade Finance System (Finastra Trade Innovation)
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
verdict: CONFIGURE
vendor: Finastra Trade Innovation (configured)
owningDomain: Trade Finance
costBand: €500k–2M configuration + €300k–600k annual licence
drivenByADR: [ADR-BGID-001]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T14:59:49Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Rationale
Finastra Trade Innovation is the bank's incumbent TFS, already running the core BG workflow with MaRisk-compliant four-eyes approval and SWIFT MT760 connectivity. Extending it via its configuration and FusionFabric open-API layer avoids the cost and migration risk of a new platform while delivering the intake enforcement, auto-routing, and MT760 acknowledgement handling required by the transformation.

## Tech stack
Finastra Trade Innovation on-premises, EU-hosted, configured via FusionFabric APIs. SWIFT Alliance integration for MT760 dispatch and acknowledgement capture. Internal REST APIs exposed for portal and notification integration.

## Risks
- Finastra upgrade cycle dependency — configuration must remain compatible with future TI releases
- Configuration complexity accumulates over multiple transformation phases
- Limited customisation ceiling for highly bespoke wording workflow logic may require external orchestration

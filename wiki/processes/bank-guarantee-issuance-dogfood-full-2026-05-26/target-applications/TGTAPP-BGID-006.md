---
id: TGTAPP-BGID-006
type: target-application
section: target-applications
title: Document Management System (In-house)
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
verdict: KEEP
vendor: In-house archival system
owningDomain: IT Architecture / Compliance
costBand: Existing system — storage extension ~€20k–50k annual
drivenByADR: [ADR-BGID-011]
provenance: {"Rationale": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Risks": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Tech stack": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T14:59:49Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Rationale
The bank's existing document management system already holds financial instrument records under the 10-year retention policy. Extending its scope to the guarantee archival capability avoids a new archival platform and reuses the existing write-once, append-only storage configuration that satisfies AML and MaRisk BTO record-keeping obligations.

## Tech stack
In-house DMS on EU-hosted infrastructure, WORM-compliant write-once storage. Event-driven ingestion via message bus subscription, audit query API for regulator access.

## Risks
- Storage capacity planning — guarantee record volume growth must be projected and provisioned for the 10-year window
- Retention policy configuration must be verified and audited for WORM lock compliance
- Regulator query interface may need enhancement for structured guarantee lifecycle search

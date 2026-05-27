---
id: ADR-BGID-011
type: adr
section: architecture-decisions
title: 10-Year Write-Once Audit Trail for Guarantee Lifecycle Records
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
adrStatus: ACCEPTED
owner: Domain Architect
domain: IT Architecture / Compliance
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T14:59:49Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Context
AML regulations (AMLD5 and AMLR) require retention of financial transaction records for a minimum of five years, extendable to ten. Bank guarantees also carry MaRisk BTO 1.2 and MiFID II record-keeping obligations. The bank's policy is ten years for trade-finance instruments. The architecture must decide how to implement the audit trail.

## Decision
Implement a write-once, append-only audit trail in the existing document management system, extended to ingest all guarantee lifecycle events from the domain event bus and retain them for ten years under WORM-compliant storage policies.

## Alternatives considered
- **Retain in TFS operational database** — rejected: TFS database is not an archival system; purge cycles conflict with retention obligations; operational query load should not include decade-old audit queries
- **Five-year retention aligned to AMLD5 minimum** — rejected: bank policy aligns to the extended ten-year period to cover MaRisk BTO and MiFID II obligations
- **Purpose-built immutable event store (Apache Kafka long-retention)** — considered viable for the event stream but rejected as the primary retention medium: Kafka is optimised for streaming, not point-in-time document retrieval for auditors

## Consequences
- DMS storage capacity must be provisioned for ten years of guarantee event volume
- Write-once WORM storage policy must be configured and audited annually
- All lifecycle events on the domain event bus must be captured without gap
- Regulator query interface may need enhancement for structured guarantee lifecycle search

---
id: ADR-DDMM-001
type: adr
section: architecture-decisions
title: Camunda 8 BPMN engine for mandate lifecycle orchestration
status: draft
confidence: high
adrStatus: ACCEPTED
owner: Domain Architect · Payments
domain: Case & lifecycle management
---
## Context
Mandate state transitions need to be observable, auditable, and SLA-enforceable. The legacy spreadsheet workflow gives none of these. Whatever runtime we pick must run BPMN authored by the business, integrate with our IAM and DMS, and survive the 2027 Q2 SEPA scheme upgrade. We evaluated three candidates.

## Decision
Adopt Camunda 8 (Zeebe + Operate + Tasklist) as the mandate-orchestration engine. Self-hosted in eu-frankfurt for the corporate-clients tenant. BPMN models authored as 2.0 with deployment from git.

## Alternatives considered
- Build on existing Pega platform — rejected: licence covers Retail only, corporate tenant would need a separate cluster
- In-house orchestrator on Postgres state machine — rejected: 4–6 FTE-quarter build, no business-readable model
- AWS Step Functions — rejected: no on-prem story for the 2027 data-residency requirement

## Consequences
- New runtime dependency on Camunda 8 — adds NFR-DDMM-006 (RTO ≤ 4h via active-passive)
- Reviewers gain a real worklist; manual mailbox triage goes away
- IAM integration via OIDC — couples this ADR to ADR-DDMM-003 (Keycloak SSO)
- BPMN models become a versioned artefact owned jointly by process owner and architect

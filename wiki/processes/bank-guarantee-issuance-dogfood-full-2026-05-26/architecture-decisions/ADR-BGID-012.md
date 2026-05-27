---
id: ADR-BGID-012
type: adr
section: architecture-decisions
title: Service-Decomposed Build: Each New Component Independently Deployable
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
adrStatus: ACCEPTED
owner: Domain Architect
domain: IT Architecture
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T14:59:49Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Context
The transformation introduces three net-new components: the AI Wording Pre-Screener, the Corporate Portal and ICC-SWIFT API extension, and a collateral notification service. These share a domain event bus but have distinct scaling, release, and governance requirements — the AI system carries EU AI Act obligations; the API extension requires SWIFT certification. The bank must decide the deployment model for these new builds.

## Decision
Deploy each new-build component as an independently deployable service, bounded by the capability it hosts and communicating via domain events and API contracts. No shared persistence across service boundaries.

## Alternatives considered
- **Monolithic portal extension** — rejected: bundles AI screener, API gateway, and notification logic into one deployable; any failure blocks all intake; AI inference cannot scale independently of the portal
- **Deploy within the Finastra TFS extension layer** — rejected: makes bank-owned capability code dependent on Finastra's release cadence; limits portability if TFS is replaced in a future phase
- **Serverless functions per capability** — considered viable for notification and headroom-query; deferred: cold-start latency is incompatible with the synchronous facility-read SLA; worth revisiting per component in solution design

## Consequences
- Requires a service mesh or API management gateway (Solution Architect to specify)
- Each service owns its schema, release pipeline, and monitoring
- Increased operational complexity: more deployment units to govern
- Independent scaling of AI inference workload is enabled

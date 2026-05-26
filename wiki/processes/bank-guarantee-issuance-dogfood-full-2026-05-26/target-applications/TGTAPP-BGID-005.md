---
id: TGTAPP-BGID-005
type: target-application
section: target-applications
title: Corporate Portal & ICC-SWIFT API Gateway
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
verdict: BUILD
vendor: In-house (Node.js/React + ICC-SWIFT adapter)
owningDomain: Trade Finance / Digital Channels
costBand: €300k–700k build + €100k–200k annual run
drivenByADR: [ADR-BGID-003]
provenance: {"Rationale": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Risks": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Tech stack": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T14:59:49Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Rationale
The existing Corporate Portal carries the portal submission channel and the client-facing guarantee workflow. Extending it with mandatory field enforcement, a real-time headroom widget, and an ICC-SWIFT-compliant API adapter preserves existing client integrations while adding the API channel required by TD-BGID-001. Building in-house retains EU data residency control and avoids a second portal vendor.

## Tech stack
Node.js backend and React frontend on the existing portal stack. New ICC-SWIFT API adapter module, OAuth 2.0 and OIDC integration to the corporate IAM. Deployed on EU-hosted Kubernetes cluster.

## Risks
- ICC-SWIFT API certification timeline and SWIFT compliance testing adds programme overhead
- ERP client adoption effort — per-corporate API onboarding and integration testing required
- Portal and API gateway share the same deployment — a portal outage affects the API channel

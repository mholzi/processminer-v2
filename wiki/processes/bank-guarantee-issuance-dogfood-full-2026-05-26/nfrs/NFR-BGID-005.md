---
id: NFR-BGID-005
type: nfr
section: nfrs
title: AES-256 at Rest + TLS 1.3 in Transit · EU Data Residency
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
category: SECURITY
target: AES-256 at rest and TLS 1.3 in transit on all six target applications; zero confidential data processed or stored outside EU-hosted infrastructure
owner: CISO
appliesTo: [TGTAPP-BGID-001, TGTAPP-BGID-002, TGTAPP-BGID-003, TGTAPP-BGID-004, TGTAPP-BGID-005, TGTAPP-BGID-006]
drivenByADR: [ADR-BGID-010]
regulatedBy: [REG-BGID-010]
provenance: {"Definition": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Measurement": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Verification": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Definition
All confidential guarantee data must be encrypted with AES-256 at rest and TLS 1.3 in transit across all six target applications. No confidential data may be processed or stored outside EU-hosted infrastructure, satisfying GDPR Article 44 cross-border transfer restrictions (REG-BGID-010).

## Measurement
Annual penetration test and cloud configuration audit confirm encryption-at-rest and in-transit settings. Data residency validated quarterly via infrastructure inventory scan; any non-EU processing is logged as a security incident and reported to the DPO.

## Verification
Pre-go-live security review confirms AES-256 storage configuration on all datastores and TLS 1.3 enforcement on all service endpoints. Data residency confirmed by infrastructure deployment manifest review before Phase 1 cutover.

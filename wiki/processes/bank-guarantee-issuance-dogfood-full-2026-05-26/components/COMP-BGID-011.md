---
id: COMP-BGID-011
type: component
section: components
title: ICC-SWIFT API Endpoint Service
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
tech: Java 21 / Spring Boot 3.2
dataStore: PostgreSQL 16 (API request audit log, EU-hosted)
hosting: EKS eu-central-1
scaling: HPA 2→8 replicas
inApp: [TGTAPP-BGID-005]
realisesCapability: [CAP-BGID-001]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Responsibility
Exposes the ICC-SWIFT-compliant API for ERP-connected corporate clients to submit guarantee applications programmatically. Validates ICC-SWIFT payload schema, enforces mandatory field rules at the API layer, and hands validated applications to the Application Event Publisher.

## Technical detail
Java 21, Spring Boot 3.2. ICC-SWIFT JSON schema validation; OpenAPI 3.1 spec at /api-docs. OAuth 2.0 client credentials per registered ERP client (corporate IAM). Returns 422 on schema violation. API request audit log in PostgreSQL 16 (EU-hosted). EKS eu-central-1, HPA 2→8 replicas.

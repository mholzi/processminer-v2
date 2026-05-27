---
id: ADR-BGID-008
type: adr
section: architecture-decisions
title: Delegate Authentication to Corporate Identity Service
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
adrStatus: ACCEPTED
owner: Domain Architect
domain: IT Architecture / Security
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T14:59:49Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Context
The Corporate Portal, ICC-SWIFT API Gateway, and TFS internal UI all need to authenticate corporate clients and internal TFO users. The bank operates a corporate identity service (IAM platform). The architecture must decide whether authentication is managed in-app within each service or centralised in the corporate IAM.

## Decision
Delegate all authentication and authorisation to the bank's corporate identity service via OAuth 2.0 and OIDC. The portal, API gateway, and TFS integration act as relying parties. No credentials or session tokens are managed within the application boundary of any guarantee-process service.

## Alternatives considered
- **In-app authentication in the portal** — rejected: duplicates identity management; violates the bank's zero-trust architecture standard; inconsistent MFA enforcement across portal and API channel
- **Finastra TIS-native user management** — rejected: limited IAM extensibility; conflates application access control with enterprise identity; TFO signatory IDs must be enterprise-issued for the dual-authorisation audit trail
- **Separate IAM per application** — rejected: creates identity silos across portal, API gateway, and TFS; contravenes the bank's identity consolidation policy

## Consequences
- Corporate IAM availability directly affects portal and API gateway access
- OAuth 2.0 and OIDC integration required from all three application surfaces
- SSO for internal TFO users flows from corporate IAM
- Enterprise-issued signatory IDs strengthen the four-eyes authorisation audit trail

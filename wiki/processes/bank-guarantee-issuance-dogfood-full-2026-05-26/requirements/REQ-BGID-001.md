---
id: REQ-BGID-001
type: requirement
section: requirements
title: ICC-SWIFT API Must Accept and Validate Structured Guarantee Application Payloads
status: draft
confidence: high
source: SME interview — transformation-agent session 2026-05-26
reqType: FUNCTIONAL
moscow: MUST
derivedFrom: [TD-BGID-001]
addresses: [VG-BGID-001]
updatedBy: admin
updatedAt: 2026-05-26T09:28:32Z
---
## Requirement
The guarantee platform must expose an ICC-SWIFT-compliant API endpoint accepting structured guarantee application payloads from ERP systems and validating all mandatory fields — including commercial contract reference, beneficiary details, guarantee amount and validity period — at the point of API receipt.

## Rationale
Without mandatory field validation at the API layer, incomplete submissions bypass the portal's enforcement gate and re-introduce the completeness gap (CG-BGID-001) on the API path; the API channel must enforce the same rules as the portal.

## Acceptance criteria
- API submissions missing any mandatory field are rejected with a structured error payload identifying each missing field by name
- Accepted API submissions generate an application record structurally identical to a portal-submitted application
- ICC Trade Finance API schema validation is applied to every inbound payload before the application is created in TFS

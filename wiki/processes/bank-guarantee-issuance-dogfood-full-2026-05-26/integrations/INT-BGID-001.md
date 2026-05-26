---
id: INT-BGID-001
type: integration
section: integrations
title: Corporate Portal to Trade Finance System — Application Submission
status: draft
confidence: medium
source: it-architect session 2026-05-26
systems: [SYS-BGID-001, SYS-BGID-002]
provenance: {"What connects": {"evidence": "Elicited: REST API, OAuth2 client-credentials, synchronous, confidential, PS-BGID-001", "source": "elicited"}, "What flows": {"evidence": "Elicited: application payload, acknowledgement, status updates", "source": "elicited"}}
updatedBy: admin
updatedAt: 2026-05-26T10:09:43Z
approval: in-progress
approvalBy: admin
approvalDate: 2026-05-26
---
## What connects
Synchronous REST API from the Corporate Portal (SYS-BGID-001) to the Trade Finance System (SYS-BGID-002). Auth: OAuth2 client-credentials; data classification: confidential.

## What flows
- Guarantee application payload (client identity, beneficiary, amount, currency, wording reference, contract reference)
- Submission acknowledgement with application ID and estimated processing timeline
- Application status updates returned to the portal for client visibility

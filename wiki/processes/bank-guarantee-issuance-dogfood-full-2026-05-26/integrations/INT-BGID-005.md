---
id: INT-BGID-005
type: integration
section: integrations
title: Trade Finance System to Document Management System — Guarantee Archival
status: draft
confidence: medium
source: it-architect session 2026-05-26
systems: [SYS-BGID-002, SYS-BGID-006]
provenance: {"What connects": {"evidence": "Elicited: async REST, confidential, 10-year retention, PS-BGID-006", "source": "elicited"}, "What flows": {"evidence": "Elicited: guarantee document, retention metadata, storage confirmation and document reference ID", "source": "elicited"}}
updatedBy: admin
updatedAt: 2026-05-26T10:09:43Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## What connects
Async REST integration from the Trade Finance System (SYS-BGID-002) to the Document Management System (SYS-BGID-006) at PS-BGID-006. Classification: confidential; retention requirement: 10 years.

## What flows
- Executed guarantee document (PDF and SWIFT-MT text) with issuance metadata pushed on guarantee generation
- Document retention metadata (issue date, expiry date, 10-year retention flag)
- Storage confirmation and document reference ID returned to TFS for audit linkage

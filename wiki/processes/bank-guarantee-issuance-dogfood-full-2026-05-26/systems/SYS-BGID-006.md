---
id: SYS-BGID-006
type: system
section: systems
title: Document Management System
status: draft
confidence: medium
source: it-architect session 2026-05-26
systemType: SUPPORTING
integrates: [SYS-BGID-002]
provenance: {"Purpose": {"evidence": "Elicited: long-term archival of executed guarantee documents; 10-year retention; vendor in-house; criticality MEDIUM", "source": "elicited"}, "Role in this process": {"evidence": "Elicited: receives executed guarantee documents from TFS at PS-BGID-006; supports audit and dispute retrieval", "source": "elicited"}}
updatedBy: admin
updatedAt: 2026-05-26T10:09:43Z
approval: in-progress
approvalBy: admin
approvalDate: 2026-05-26
---
## Purpose
Archival and retrieval platform for executed bank guarantee documents. Vendor: in-house. Criticality: MEDIUM. Data classification: confidential. RTO: 24h, RPO: 4h.

## Role in this process
Receives executed guarantee documents pushed from the Trade Finance System at PS-BGID-006. Stores documents with a 10-year retention flag and provides retrieval for audit and dispute resolution.

---
id: SYS-BGID-005
type: system
section: systems
title: Facility/Credit System
status: draft
confidence: medium
source: it-architect session 2026-05-26
systemType: CORE
integrates: [SYS-BGID-002]
provenance: {"Purpose": {"evidence": "Elicited: core banking credit system; vendor in-house; criticality HIGH; RTO 8h, RPO 1h", "source": "elicited"}, "Role in this process": {"evidence": "Elicited: consulted at PS-BGID-002 for headroom check; updated async post-issuance at PS-BGID-007; lag documented in EX-BGID-006, DEP-BGID-001", "source": "elicited"}}
updatedBy: admin
updatedAt: 2026-05-26T10:09:43Z
approval: in-progress
approvalBy: admin
approvalDate: 2026-05-26
---
## Purpose
Core banking system managing client guarantee facility limits and utilisation. Vendor: in-house. Criticality: HIGH. Data classification: confidential. RTO: 8h, RPO: 1h.

## Role in this process
Consulted synchronously at PS-BGID-002 to verify available facility headroom; updated asynchronously post-issuance at PS-BGID-007 to reflect guarantee utilisation. Typical update lag is 1 business day — see EX-BGID-006 and DEP-BGID-001.

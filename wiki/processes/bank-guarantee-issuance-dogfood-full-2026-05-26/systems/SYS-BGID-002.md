---
id: SYS-BGID-002
type: system
section: systems
title: Trade Finance System
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
systemType: CORE
integrates: [SYS-BGID-001, SYS-BGID-003, SYS-BGID-004, SYS-BGID-005, SYS-BGID-006]
provenance: {"Purpose": {"evidence": "", "source": "proposed"}, "Role in this process": {"evidence": "", "source": "proposed"}}
updatedBy: admin
updatedAt: 2026-05-26T10:10:10Z
approval: in-progress
approvalBy: admin
approvalDate: 2026-05-26
---
## Purpose
System of record for guarantee instruments, approvals and facility utilisation. Vendor: Finastra Trade Innovation. Criticality: HIGH. Data classification: confidential. RTO: 4h, RPO: 15min.

## Role in this process
Used at the credit check (Step 2), issuance approval (Step 5), guarantee generation (Step 6), and facility utilisation update. Approvals and instruments are recorded and stored here; the system blocks issuance if the facility limit is insufficient.

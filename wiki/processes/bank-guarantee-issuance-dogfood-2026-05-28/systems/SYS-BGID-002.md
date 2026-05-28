---
id: SYS-BGID-002
type: system
section: systems
title: Trade Finance System
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
systemType: CORE
criticality: HIGH
vendor: Finastra Trade Innovation (on-prem)
dataClassification: confidential
rtoBand: 4h
rpoBand: 15min
integrates: []
updatedBy: the assistant
updatedAt: 2026-05-28T14:28:03Z
approval: approved
approvalBy: admin
approvalDate: 2026-05-28
---
## Purpose
Core system of record for guarantee instruments, issuance approvals, and client facility utilisation within the trade finance function.

## Role in this process
Used across PS-BGID-002, PS-BGID-003, PS-BGID-005, and PS-BGID-006: hosts the standard wording template library (step 3), enforces the facility limit check (step 2), records manager issuance approval (step 5), and hosts guarantee generation with facility utilisation update on delivery (step 6). Actual RTO target 2h / RPO 15min (Tier-1).

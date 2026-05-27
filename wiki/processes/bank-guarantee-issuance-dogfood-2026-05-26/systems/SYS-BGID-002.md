---
id: SYS-BGID-002
type: system
section: systems
title: Trade Finance System
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
systemType: CORE
integrates: [SYS-BGID-001, SYS-BGID-003, SYS-BGID-004]
updatedBy: the assistant
updatedAt: 2026-05-26T05:18:45Z
---
## Purpose
System of record for guarantee instruments, approvals and facility utilisation.

## Role in this process
Used at issuance approval to record the Trade Finance Manager's approval, and at guarantee generation and delivery to produce the instrument and update the client's facility utilisation. Issuance is blocked in this system unless available limit covers the guarantee amount.

---
id: SYS-BGID-002
type: system
section: systems
title: Trade Finance System
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
systemType: CORE
integrates: [SYS-BGID-004]
updatedBy: the assistant
updatedAt: 2026-05-25T20:57:06Z
---
## Purpose
System of record for guarantee instruments, approvals and facility utilisation.

## Role in this process
Used across three steps: Credit and Facility Check, Issuance Approval, and Guarantee Generation and Delivery. Approval is recorded here, issuance is blocked if facility limit is insufficient, and the guarantee instrument is generated before SWIFT transmission.

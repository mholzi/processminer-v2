---
id: SYS-BGID-004
type: system
section: systems
title: SWIFT
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
systemType: EXTERNAL
criticality: HIGH
vendor: SWIFT (direct member)
dataClassification: confidential
integrates: []
updatedBy: the assistant
updatedAt: 2026-05-28T14:24:33Z
approval: approved
approvalBy: admin
approvalDate: 2026-05-28
---
## Purpose
Network used to transmit executed guarantee instruments to beneficiary banks via SWIFT MT760 messages.

## Role in this process
Delivery channel at PS-BGID-006; the bank holds direct SWIFT membership and uses MT760 for guarantee transmission. No operational fallback — delivery pauses if SWIFT is unavailable. MX (ISO 20022) migration is planned but not yet live for guarantees.

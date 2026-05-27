---
id: SYS-BGID-004
type: system
section: systems
title: SWIFT
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
systemType: EXTERNAL
integrates: [SYS-BGID-002]
updatedBy: admin
updatedAt: 2026-05-26T10:10:05Z
approval: in-progress
approvalBy: admin
approvalDate: 2026-05-26
---
## Purpose
Interbank messaging network for transmitting executed guarantee instruments to beneficiary banks. Vendor: SWIFT Alliance Access. Criticality: HIGH. Data classification: confidential. RTO: 1h, RPO: 0.

## Role in this process
Used at the Guarantee Generation and Delivery step. Once the guarantee is generated in the Trade Finance System, it is transmitted to the beneficiary's bank via SWIFT.

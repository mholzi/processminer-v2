---
id: SYS-BGID-003
type: system
section: systems
title: Sanctions Screening Tool
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
systemType: SUPPORTING
criticality: HIGH
vendor: Fircosoft
dataClassification: confidential
rtoBand: 4h
rpoBand: 1h
integrates: []
updatedBy: the assistant
updatedAt: 2026-05-28T14:29:37Z
approval: approved
approvalBy: admin
approvalDate: 2026-05-28
---
## Purpose
Screening tool used by the Compliance function to check parties against the sanctions list.

## Role in this process
Used at PS-BGID-004 to screen the beneficiary and beneficiary's country against the sanctions list. A hit suspends the application pending Compliance Operations investigation; the result is attached as evidence for CP-BGID-002. If unavailable, Compliance queues the application; a degraded manual list check is possible only under a hard deadline.

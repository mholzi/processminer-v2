---
id: PS-BGI-005
type: process-step
section: process-steps
title: Issuance Approval
status: draft
confidence: high
owner: Trade Finance Manager
condition: Sanctions screening cleared
systems: [SYS-BGI-002]
source: bank-guarantee-issuance-v1.md
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-19
---
## What happens
The Trade Finance Manager performs a substantive final review of the assembled application package: confirming all upstream checks have cleared, that the terms and amount are within the bank's delegated authority, and that pricing and fees are correct. The approval is recorded in the Trade Finance System. For guarantees above EUR 5 million, the Trade Finance System enforces an additional electronic sign-off by the Head of Trade Finance — the TFM cannot finalise issuance alone above this threshold. The TFM may also decline the application outright or return it to the TFO for rework.

## Inputs
- Complete application package
- Attached sanctions screening result
- Guarantee amount (determines whether Head of Trade Finance sign-off is system-required)

## Outputs
- Issuance approval recorded in the Trade Finance System
- Head of Trade Finance electronic sign-off recorded where guarantee exceeds EUR 5 million

## Why it matters
No guarantee is issued without a Trade Finance Manager's approval (four-eyes issuance approval control); the substantive review is the last opportunity to catch errors in terms, pricing or delegated-authority limits.

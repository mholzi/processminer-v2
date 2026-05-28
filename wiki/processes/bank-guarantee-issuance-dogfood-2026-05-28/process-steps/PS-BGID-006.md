---
id: PS-BGID-006
type: process-step
section: process-steps
title: Guarantee Generation and Delivery
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
owner: Trade Finance Officer
sla: 3 business days from receipt of a complete application (standard wording, no screening hit)
condition: Issuance has been approved by the required authority level.
systems: [SYS-BGID-002, SYS-BGID-004]
updatedBy: the assistant
updatedAt: 2026-05-28T13:58:42Z
approval: approved
approvalBy: admin
approvalDate: 2026-05-28
---
## What happens
The Trade Finance Officer generates the guarantee instrument in the Trade Finance System using the approved wording and details. The Trade Finance System enforces a system check that the generated instrument amount matches the approved amount (part of CP-BGID-003). The executed guarantee is transmitted to the beneficiary's bank via SWIFT. The client's facility utilisation is updated in the Trade Finance System. The TFO then emails the issued instrument to the client and relationship manager on the same business day.

## Inputs
- Approved application package with all sign-offs
- Approved guarantee wording
- Beneficiary bank SWIFT details
- Client facility record for utilisation update

## Outputs
- Executed guarantee instrument record in the Trade Finance System
- Guarantee transmitted to beneficiary's bank via SWIFT
- Client facility utilisation updated
- Issued instrument emailed to client and relationship manager (same business day)

## Why it matters
Accurate generation, timely SWIFT transmission and immediate facility update close the issuance loop, ensure the beneficiary receives a valid instrument, and keep the bank's exposure records current.

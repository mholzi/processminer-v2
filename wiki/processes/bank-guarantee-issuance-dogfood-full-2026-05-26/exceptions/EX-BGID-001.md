---
id: EX-BGID-001
type: exception
section: exceptions
title: SWIFT Delivery Failure
status: confirmed
confidence: high
source: bank-guarantee-issuance-v1.md
category: transmission failure
impact: HIGH
handlingOwner: Trade Finance Officer
updatedBy: admin
updatedAt: 2026-05-26T19:11:43.605Z
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-26
frequencyPct: 2%
---
## Description
The SWIFT transmission of the executed guarantee instrument returns a negative acknowledgement (NAK) — the message was rejected or not delivered to the beneficiary's bank. This can occur at the final step of issuance after the guarantee has already been generated and approved.

## Handling
The Trade Finance Officer investigates the reason for the NAK — typically incorrect beneficiary bank details or a SWIFT connectivity issue — and resubmits the message once the root cause is resolved. The guarantee instrument remains valid in the Trade Finance System pending successful delivery.

## Impact
Delays guarantee delivery to the beneficiary, potentially breaching the 3-business-day SLA and affecting the client's commercial obligation to the beneficiary.

---
id: EX-BGID-001
type: exception
section: exceptions
title: SWIFT Delivery Failure
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
category: transmission failure
impact: HIGH
handlingOwner: Trade Finance Officer
provenance: {"Description": {"evidence": "SWIFT NAK → TFO investigates and resubmits; record this as an exception (SWIFT delivery failure)", "source": "elicited"}, "Handling": {"evidence": "SWIFT NAK → TFO investigates and resubmits", "source": "elicited"}, "Impact": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-26T06:30:45Z
approval: approved
approvalBy: admin
approvalDate: 2026-05-26
---
## Description
The SWIFT transmission of the executed guarantee instrument returns a negative acknowledgement (NAK) — the message was rejected or not delivered to the beneficiary's bank. This can occur at the final step of issuance after the guarantee has already been generated and approved.

## Handling
The Trade Finance Officer investigates the reason for the NAK — typically incorrect beneficiary bank details or a SWIFT connectivity issue — and resubmits the message once the root cause is resolved. The guarantee instrument remains valid in the Trade Finance System pending successful delivery.

## Impact
Delays guarantee delivery to the beneficiary, potentially breaching the 3-business-day SLA and affecting the client's commercial obligation to the beneficiary.

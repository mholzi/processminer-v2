---
id: PS-BGID-006
type: process-step
section: process-steps
title: Guarantee Generation and Delivery
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
owner: Trade Finance Officer
sla:
condition: Issuance approval recorded in Trade Finance System
systems: [SYS-BGID-002, SYS-BGID-004]
provenance: {"Inputs": {"evidence": "[Y] Accept", "source": "elicited"}, "Outputs": {"evidence": "[Y] Accept", "source": "elicited"}, "What happens": {"evidence": "[Y] Accept", "source": "elicited"}, "Why it matters": {"evidence": "[Y] Accept", "source": "elicited"}}
updatedBy: admin
updatedAt: 2026-05-26T18:27:54Z
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-26
transitions: [EX-BGID-001|exception|SWIFT NAK received on delivery]
---
## What happens
The Trade Finance Officer generates the guarantee instrument in the Trade Finance System using the approved wording and details. The executed guarantee is transmitted to the beneficiary's bank via SWIFT. The client's facility utilisation record is updated to reflect the new exposure.

## Inputs
- Approved application package
- Approval record in Trade Finance System
- Final approved wording

## Outputs
- Executed guarantee instrument stored in Trade Finance System
- SWIFT message delivered to beneficiary's bank
- Client facility utilisation updated

## Why it matters
Completes the process by issuing the legal instrument and updating the exposure record — ensuring the bank's books accurately reflect the contingent liability taken on.

---
id: PS-BGIT-006
type: process-step
section: process-steps
title: Guarantee Generation and Delivery
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
owner: Trade Finance Officer
systems: [SYS-BGIT-002, SYS-BGIT-004]
provenance: {"Inputs": {"evidence": "M. Berger: standing approval", "source": "elicited"}, "Outputs": {"evidence": "the guarantee is transmitted to the beneficiary's bank via SWIFT. The client's facility utilisation is updated.", "source": "document"}, "What happens": {"evidence": "The Trade Finance Officer generates the guarantee instrument in the Trade Finance System and the guarantee is transmitted to the beneficiary's bank via SWIFT. The client's facility utilisation is updated.", "source": "document"}, "Why it matters": {"evidence": "M. Berger: standing approval", "source": "elicited"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-20
---
## What happens
The Trade Finance Officer generates the guarantee instrument in the Trade Finance System. The executed guarantee is transmitted to the beneficiary's bank via SWIFT, and the client's facility utilisation is updated.

## Inputs
- Approved guarantee package from Step 5
- Guarantee wording (standard template or Legal-approved bespoke)

## Outputs
- Executed guarantee instrument recorded in Trade Finance System
- SWIFT message transmitted to beneficiary's bank
- Client facility utilisation updated

## Why it matters
Delivers the executed guarantee to the beneficiary and closes the issuance cycle, completing the bank's commitment and updating credit records.

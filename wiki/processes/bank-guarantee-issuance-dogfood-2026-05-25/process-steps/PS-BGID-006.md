---
id: PS-BGID-006
type: process-step
section: process-steps
title: Guarantee Generation and Delivery
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
owner: Trade Finance Officer
systems: [SYS-BGID-002, SYS-BGID-004]
transitions: []
provenance: {"Inputs": {"evidence": "", "source": "proposed"}, "Outputs": {"evidence": "The Trade Finance Officer generates the guarantee instrument in the Trade Finance System and the guarantee is transmitted to the beneficiary's bank via SWIFT. The client's facility utilisation is updated.", "source": "document"}, "What happens": {"evidence": "The Trade Finance Officer generates the guarantee instrument in the Trade Finance System and the guarantee is transmitted to the beneficiary's bank via SWIFT. The client's facility utilisation is updated.", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:56:10Z
---
## What happens
The Trade Finance Officer generates the guarantee instrument in the Trade Finance System using the approved details. The executed guarantee is then transmitted to the beneficiary's bank via SWIFT. The client's guarantee facility utilisation is updated in the Trade Finance System to reflect the new commitment.

## Inputs
- Approved application package with issuance authorisation
- Approved guarantee wording

## Outputs
- Executed guarantee instrument record in the Trade Finance System
- SWIFT transmission of the guarantee to the beneficiary's bank
- Updated client facility utilisation in the Trade Finance System

## Why it matters
This step closes the process and delivers the executed guarantee to the beneficiary while ensuring the client's facility utilisation is accurately reflected.

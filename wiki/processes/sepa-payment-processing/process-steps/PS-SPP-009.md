---
id: PS-SPP-009
type: process-step
section: process-steps
title: Settlement & confirmation
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
owner: Payment Hub
sla: SCT Inst settlement and beneficiary-bank confirmation within 10 seconds
systems: [SYS-SPP-002, SYS-SPP-006]
provenance: {"Inputs": {"evidence": "For SCT Inst, settlement and the beneficiary-bank confirmation complete within 10 seconds", "source": "document"}, "Outputs": {"evidence": "Both confirmations are automated — the hub sends them, not Ops; instant goes out immediately, standard goes out when the STEP2 cycle confirms.", "source": "elicited"}, "What happens": {"evidence": "Both confirmations are automated — the hub sends them, not Ops; instant goes out immediately, standard goes out when the STEP2 cycle confirms. The 10 seconds is the scheme clock from when we submit to RT1.", "source": "elicited"}, "Why it matters": {"evidence": "Take this exception out. This is inbound after the process has been completed.", "source": "elicited"}}
transitions: [PS-SPP-010|normal|when settlement is confirmed, EX-SPP-005|exception|when an SCT Inst attempt times out or is rejected]
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-18
---
## What happens
For SCT Inst, settlement and the beneficiary-bank confirmation complete within 10 seconds — measured on the scheme clock from the bank's submission to RT1 — and the payment hub sends the customer an immediate confirmation. For standard SCT, settlement completes in the next STEP2 cycle; the payment shows as executed in the meantime and the hub notifies the customer once that cycle confirms. Both confirmations are automated hub notifications, not manual Operations actions.

## Inputs
- pacs.008 submission lodged with the CSM
- CSM settlement and beneficiary-bank confirmation

## Outputs
- Settled payment, passed to end-of-day reconciliation
- Automated hub confirmation to the customer — immediate for SCT Inst, on STEP2-cycle settlement for standard SCT

## Why it matters
The 10-second settlement and confirmation is the SCT Inst scheme promise to the customer; an instant timeout or beneficiary-bank rejection routes to Exception E-5. A standard SCT that fails to settle has no exit transition here; it is detected at end-of-day reconciliation, and any inbound return re-crediting the customer is handled out of scope by the inbound process (PRC-OPS-0174).

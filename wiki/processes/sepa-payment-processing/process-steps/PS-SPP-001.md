---
id: PS-SPP-001
type: process-step
section: process-steps
title: Receive instruction
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
owner: Payment Hub
systems: [SYS-SPP-001, SYS-SPP-002]
provenance: {"Inputs": {"evidence": "all 3 make sense — confirmed BIC is optional for SEPA and the instant/standard election is captured at receipt", "source": "elicited"}, "Outputs": {"evidence": "The payment instruction arrives at the payment hub from one of the channels.", "source": "document"}, "What happens": {"evidence": "all 3 make sense — confirmed BIC is optional for SEPA and the instant/standard election is captured at receipt", "source": "elicited"}, "Why it matters": {"evidence": "all 3 make sense", "source": "elicited"}}
transitions: [PS-SPP-002|normal|]
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-18
---
## What happens
The payment instruction arrives at the payment hub from one of the channels — online or mobile banking, the corporate host-to-host file channel, or branch capture. Each instruction carries the debtor account, creditor IBAN, creditor name, BIC (optional for SEPA), the amount in EUR, a remittance reference and the customer's instant-or-standard execution election. Bulk and file-based payments arrive as pain.001 messages.

## Inputs
- Customer payment instruction from online or mobile banking
- Corporate bulk payment file submitted as a pain.001 message
- Branch-captured payment instruction
- Debtor account, creditor IBAN, creditor name and BIC (optional for SEPA)
- Amount in EUR and a remittance reference
- The customer's instant-or-standard execution election

## Outputs
- Payment instruction registered at the payment hub
- Structured payment record ready for validation

## Why it matters
This is the single entry point for every outbound SEPA payment; capturing each instruction consistently across all three channels lets the rest of the process run on one structured record.

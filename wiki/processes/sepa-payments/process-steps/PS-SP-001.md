---
id: PS-SP-001
type: process-step
section: process-steps
title: Receive instruction
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
owner: Payments Operations
sla:
condition: Customer submits a euro payment instruction via online/mobile banking, a corporate customer uploads a payment file via host-to-host, or a branch user captures a payment on behalf of the customer
systems: [SYS-SP-001, SYS-SP-002]
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:15Z
---
## What happens
The payment instruction arrives at the payment hub from one of the three origination channels: online/mobile banking, host-to-host bulk file upload (pain.001), or branch capture. Each instruction carries the debtor account, creditor IBAN, creditor name, BIC (optional for SEPA), amount in EUR, remittance reference, and the customer's rail election (instant or standard).

## Inputs
- Debtor account identifier
- Creditor IBAN and creditor name
- BIC (optional for SEPA)
- Amount in EUR and remittance reference
- Customer rail election (instant or standard SCT)
- Channel identifier (online / mobile / host-to-host / branch)

## Outputs
- Payment instruction record in the payment hub queue
- Raw instruction data available for validation (Step 2)

## Why it matters
This step is the entry gate for all outbound SEPA payments. A complete and correctly routed instruction at intake reduces downstream validation failures and ensures the hub has all data required for subsequent checks.

---
id: ROLE-SP-001
type: role
section: roles
title: Customer / Channel
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
systems: [SYS-SP-001]
controls: []
provenance: {"In this process": {"evidence": "Section 5.1 step 1: 'Each carries debtor account, creditor IBAN, creditor name, BIC (optional for SEPA), amount in EUR, and a remittance reference. Bulk files arrive as pain.001 messages.' Section 3: 'A corporate customer uploads a payment file via the host-to-host channel.' RACI table: Customer/Channel = A/R for Submit payment instruction. Exception E-4: 'customer contacted for step-up verification; released or cancelled on the outcome.' Exception E-1: 'Payment rejected to the customer with a reason code; correction and resubmission required.'", "source": "document"}, "Responsibility": {"evidence": "Section 3 Trigger: 'A customer submits a euro payment instruction via online or mobile banking … A corporate customer uploads a payment file via the host-to-host channel.' Section 8: 'Channel platforms (online / mobile / host-to-host) — Capture and submit payment instructions.' Section 5.1 step 9: 'the customer is notified immediately … the customer sees the payment as executed.'", "source": "document"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:15Z
---
## Responsibility
Initiates euro payment instructions through the bank's channels and receives execution confirmation.

## In this process
The customer (or a channel system acting on the customer's behalf) submits the payment instruction at step ps-1 — providing debtor account, creditor IBAN, creditor name, amount and remittance reference. For host-to-host corporate customers, this includes uploading a pain.001 bulk file. The customer is informed of the outcome at settlement and confirmation (ps-9), and is notified of any exceptions that require action such as step-up verification for a fraud hold (E-4) or correction and resubmission after a validation reject (E-1).

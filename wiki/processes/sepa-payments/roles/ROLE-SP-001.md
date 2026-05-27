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
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:15Z
---
## Responsibility
Initiates euro payment instructions through the bank's channels and receives execution confirmation.

## In this process
The customer (or a channel system acting on the customer's behalf) submits the payment instruction at step ps-1 — providing debtor account, creditor IBAN, creditor name, amount and remittance reference. For host-to-host corporate customers, this includes uploading a pain.001 bulk file. The customer is informed of the outcome at settlement and confirmation (ps-9), and is notified of any exceptions that require action such as step-up verification for a fraud hold (E-4) or correction and resubmission after a validation reject (E-1).

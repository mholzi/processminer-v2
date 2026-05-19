---
id: SPP
type: process
section: overview
title: SEPA Payment Processing
status: draft
description: Processes outbound euro credit transfers within the SEPA zone — on the standard (SCT) and instant (SCT Inst) rails — from instruction capture through clearing, settlement and reconciliation.
sources: [sepa-payments-dtp-mockup.md]
confidence: high
source: sepa-payments-dtp-mockup.md
processOwner: Head of Payment Operations
trigger: One of: a customer submits a euro payment instruction via online or mobile banking; a corporate customer uploads a payment file via the host-to-host channel; or a branch user captures a payment on the customer's behalf.
frequency:
scopeIn: Outbound SEPA Credit Transfers (SCT) and SEPA Instant Credit Transfers (SCT Inst) initiated by corporate and retail customers; single payments and bulk / file-based host-to-host batches; and handling of R-transactions (returns, rejects, recalls, refunds).
scopeOut: Inbound SEPA payments and inbound R-transaction handling (PRC-OPS-0174); SEPA Direct Debit (SDD) collections; non-euro and non-SEPA cross-border payments (PRC-OPS-0151); and card payments.
processInput: Payment instruction with debtor account, creditor IBAN, creditor name, BIC, amount in EUR, remittance reference, originating channel and the customer's instant-or-standard election.
processOutput: A pacs.008 submission to the clearing and settlement mechanism, the debit booking on the customer account, a confirmation to the customer, and a settlement reconciliation record.
docStatus: As-Is draft
approval: approved
approvalBy: Markus
approvalDate: 2026-05-18
---
SEPA Payments is the processing of outbound euro credit transfers within the Single Euro Payments Area, on both the standard SEPA Credit Transfer (SCT) and the SEPA Instant (SCT Inst) rails. It covers single payments as well as bulk, file-based host-to-host batches initiated by corporate and retail customers, and the handling of R-transactions.

This documentation captures the current ("as-is") state of the process as described by the subject matter expert. It is the basis for later target-state design.

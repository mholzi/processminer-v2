---
id: SP
type: process
section: overview
title: Sepa Payments
status: draft
description: The end-to-end process for initiating, validating, and settling outbound SEPA Credit Transfer (SCT and SCT Inst) payments across the Eurozone.
sources: [sepa-payments-dtp-mockup.md]
confidence: high
source: sepa-payments-dtp-mockup.md
processOwner:
trigger: A customer submits a euro payment instruction via online or mobile banking; a corporate customer uploads a payment file via the host-to-host channel; or a branch user captures a payment on the customer's behalf.
frequency:
scopeIn: Outbound SEPA Credit Transfers (SCT) initiated by corporate and retail customers; outbound SEPA Instant Credit Transfers (SCT Inst); single payments and bulk / file-based (host-to-host) payment batches; handling of R-transactions (returns, rejects, recalls, refunds).
scopeOut: Inbound SEPA payments and inbound R-transaction handling (PRC-OPS-0174); SEPA Direct Debit (SDD) collections; non-euro and non-SEPA cross-border payments (PRC-OPS-0151); card payments.
processInput: Debtor account, creditor IBAN, creditor name, BIC (optional for SEPA), amount in EUR, remittance reference, channel and customer election (instant or standard).
processOutput: pacs.008 submission to the CSM, debit booking, customer confirmation, settlement reconciliation record.
docStatus: As-Is draft
---
To process outbound euro credit transfers within the Single Euro Payments Area on the standard SEPA Credit Transfer (SCT) and SEPA Instant (SCT Inst) rails, for both corporate and retail customers.

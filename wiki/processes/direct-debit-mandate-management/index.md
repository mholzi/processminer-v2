---
id: DDMM
type: process
section: overview
title: Direct Debit Mandate Management
status: draft
description: Covers the operational handling of SEPA Direct Debit mandates the bank registers and maintains for corporate creditor clients — registration, amendment, cancellation, and resolution of inbound R-transactions referencing those mandates.
sources: [ddmm-dtp-mockup.md]
confidence: high
source: ddmm-dtp-mockup.md
processOwner: Head of Payments Operations
trigger: One of: (1) a corporate creditor submits a new mandate or bulk mandate file via the Creditor Portal; (2) a creditor submits a mandate amendment or cancellation request; or (3) an inbound R-transaction referencing a mandate is received from a debtor bank via the payment scheme.
frequency: ~300–400 requests/day; ~10–15 bulk files/week
scopeIn: Registration of new SDD mandates submitted by corporate creditor clients; amendment of existing mandates (IBAN change, creditor name change); cancellation of mandates; handling of mandate-related R-transactions (rejects, refusals); single-mandate capture and bulk mandate file upload.
scopeOut: Collection of direct debit payments themselves (covered by PRC-OPS-0177, SEPA Collections); onboarding of the corporate creditor and assignment of the Creditor Identifier (CI); retail customers acting as creditors.
processInput: Unique Mandate Reference (UMR), Creditor Identifier (CI), debtor name, debtor IBAN, mandate type, signature date, bulk mandate files.
processOutput: Registered mandate record, creditor confirmation, updated mandate store, R-transaction resolution.
docStatus: As-Is draft
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
The Direct Debit Mandate Management process covers the operational handling of SEPA Direct Debit mandates that the bank registers and maintains on behalf of its corporate creditor clients. A mandate is the debtor's signed authorisation that allows a creditor to collect direct debits from the debtor's account.

The process ensures that mandates are accurately validated, screened for sanctions compliance, and registered in the Mandate Management System before confirmation is returned to the creditor. It also handles the full range of mandate changes — amendments and cancellations — and resolves inbound R-transactions that reference managed mandates.

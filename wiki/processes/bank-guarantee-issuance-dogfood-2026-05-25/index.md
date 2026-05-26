---
id: BGID
type: process
section: overview
title: Bank Guarantee Issuance — Dogfood 2026-05-25
status: draft
description: End-to-end process for issuing bank guarantees to corporate clients, covering application, credit assessment, documentation, approval, and issuance.
sources: [bank-guarantee-issuance-v1.md]
confidence: high
source: bank-guarantee-issuance-v1.md
processOwner:
trigger: A corporate client submits a Bank Guarantee application through the Corporate Portal, or via a relationship manager who keys it into the portal on the client's behalf.
frequency:
scopeIn: Issuance of a Bank Guarantee on behalf of a corporate client in favour of a third-party beneficiary, from application submission to delivery of the executed guarantee and facility utilisation update.
scopeOut: Guarantee amendments, claims and cancellations, which are separate processes.
processInput: Client Bank Guarantee application (including beneficiary details, guarantee amount, currency, wording type, validity period and underlying commercial contract reference).
processOutput: Executed Bank Guarantee instrument transmitted to the beneficiary's bank via SWIFT; client facility utilisation updated in the Trade Finance System.
docStatus: As-Is draft
---
This process covers the issuance of a Bank Guarantee on behalf of a corporate client in favour of a third-party beneficiary. It begins when a client submits a guarantee application and ends when the executed guarantee is delivered to the beneficiary and the client's facility utilisation is updated.

The process runs through six steps — application intake, credit and facility check, wording review, sanctions and compliance screening, issuance approval, and guarantee generation and delivery — supported by three mandatory controls and a 3-business-day SLA target for standard-wording cases.

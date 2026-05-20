---
id: DCR
type: process
section: overview
title: Debit Card Replacement
status: draft
description: Replaces a retail customer's debit card when it has been lost, stolen, or damaged, including identity verification, blocking the old card, and issuing and dispatching a new one.
sources: [dcr-dtp-mockup.md, dcr-sla-update-memo.md]
confidence: high
source: dcr-dtp-mockup.md
processOwner: Head of Retail Card Operations
trigger: A retail customer reports, via the Contact Centre or the mobile app, that their debit card has been lost, stolen, or damaged and requests a replacement.
frequency:
scopeIn: Replacement of retail debit cards reported lost, stolen, or damaged; customer-initiated requests through the Contact Centre and mobile app; blocking the existing card and issuing a like-for-like replacement.
scopeOut: Credit card replacement; new card issuance for new accounts; card product upgrades or changes of card type; fraud investigation and chargebacks.
processInput: Customer identifier, card number, reported reason (lost / stolen / damaged), registered address.
processOutput: Blocked card, replacement card order, dispatched card, customer confirmation.
docStatus: As-Is draft
approval: approved
approvalBy: S. Krause
approvalDate: 2026-05-19
---
This process replaces a retail customer's debit card when the existing card has been lost, stolen, or physically damaged. It takes the customer from the moment they report the problem through identity verification, blocking the existing card, a fraud exposure check for lost or stolen cards, and the ordering and dispatch of a like-for-like replacement.

It is both a service process and a fraud-control process: the customer needs a working card back quickly, while the bank must ensure the compromised card is rendered unusable and that no unauthorised person can drive a block or a replacement. Speed and control are in tension at every step.

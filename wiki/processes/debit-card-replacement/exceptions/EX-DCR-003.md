---
id: EX-DCR-003
type: exception
section: exceptions
title: Registered address unconfirmed or stale
status: draft
confidence: high
source: dcr-dtp-mockup.md
impact: LOW
handlingOwner: Card Operations Clerk
category: Data quality
approval: approved
approvalBy: S. Krause
approvalDate: 2026-05-19
---
## Description
The customer's registered address on file is unconfirmed or out of date, so there is no reliable address to dispatch the replacement card to.

## Handling
The card cannot be dispatched. The customer must confirm or update their registered address before the replacement order is released to the card bureau.

## Impact
Holds the replacement order and delays delivery until the customer's address is confirmed.

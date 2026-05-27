---
id: PP-DCR-004
type: pain-point
section: pain-points
title: No delivery tracking once the card leaves for the bureau
status: draft
confidence: medium
source: Foundational run - S. Krause
category: Visibility
severity: MEDIUM
priority: P2
affects: [PS-DCR-006]
---
## Description
Once the replacement order is released to the card bureau, the process has no visibility of the card in production or in the post until the customer either uses it or calls to say it never arrived.

## Impact
When a card is lost in the post the customer must call back and the whole replacement is started again from scratch, doubling the effort and the delay for the customer.

## Root cause
The card bureau interface is a one-way instruction with no tracking or delivery-confirmation feed back into the Card Management System.

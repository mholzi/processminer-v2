---
id: EX-SP-006
type: exception
section: exceptions
title: Inbound R-transaction
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
category: r-transaction
impact: MEDIUM
handlingOwner: Payments Operations
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:00Z
---
## Description
An R-transaction message (return, recall, or refund) is received in response to a previously submitted outbound SEPA payment.

## Handling
Payments Operations matches the R-transaction to the original payment record. For returns and refunds, the funds are re-credited to the debtor account. For recall requests, the recall is actioned within the EPC scheme deadline of 10 business days.

## Impact
Late action on recalls risks breach of EPC scheme obligations. Delays in re-crediting funds damage client trust and generate complaints.

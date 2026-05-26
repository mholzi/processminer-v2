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
provenance: {"Description": {"evidence": "Section 2 scope: 'Handling of R-transactions (returns, rejects, recalls, refunds).' Section 11 glossary: 'R-transaction: A return, reject, recall or refund of a SEPA payment.'", "source": "document"}, "Handling": {"evidence": "Section 6 E-6: 'Matched to the original payment; funds re-credited or recall actioned within scheme deadlines.' Section 9 SLA: 'Recall / return action: Within the EPC scheme deadline (10 business days).'", "source": "document"}, "Impact": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:00Z
---
## Description
An R-transaction message (return, recall, or refund) is received in response to a previously submitted outbound SEPA payment.

## Handling
Payments Operations matches the R-transaction to the original payment record. For returns and refunds, the funds are re-credited to the debtor account. For recall requests, the recall is actioned within the EPC scheme deadline of 10 business days.

## Impact
Late action on recalls risks breach of EPC scheme obligations. Delays in re-crediting funds damage client trust and generate complaints.

---
id: EX-SP-003
type: exception
section: exceptions
title: Confirmed sanctions or AML hit
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
category: sanctions-aml
impact: HIGH
handlingOwner: Compliance
provenance: {"Description": {"evidence": "Step 4: 'Debtor and creditor are screened against sanctions lists; the payment is checked by AML transaction monitoring. Clean items pass automatically; potential hits route to Compliance.'", "source": "document"}, "Handling": {"evidence": "Section 6 E-3: 'Payment frozen; escalated to Compliance and Financial Crime; release blocked pending investigation.'", "source": "document"}, "Impact": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:00Z
---
## Description
Sanctions or AML screening returns a confirmed positive match and the payment is routed to Compliance for review.

## Handling
The payment is frozen and escalated to Compliance and the Financial Crime unit. Release of the payment is blocked pending investigation.

## Impact
Severe compliance and legal exposure if not handled correctly. The customer cannot access the funds during investigation.

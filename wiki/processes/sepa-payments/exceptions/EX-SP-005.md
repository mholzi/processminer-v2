---
id: EX-SP-005
type: exception
section: exceptions
title: SCT Inst timeout or beneficiary-bank rejection
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
category: scheme-failure
impact: MEDIUM
handlingOwner: Payments Operations
provenance: {"Description": {"evidence": "Step 9: 'For SCT Inst, settlement and the beneficiary-bank confirmation complete within 10 seconds.' Decision D-6: 'SCT Inst confirmed in 10s?' Section 6 E-5 heading: 'SCT Inst timeout or beneficiary-bank rejection.'", "source": "document"}, "Handling": {"evidence": "Section 6 E-5: 'Auto-fallback to standard SCT where eligible; otherwise returned to the customer.'", "source": "document"}, "Impact": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:00Z
---
## Description
The SCT Inst submission to the RT1 instant gateway does not receive a positive confirmation within the 10-second scheme deadline, or the beneficiary bank explicitly rejects the instant payment.

## Handling
The payment hub falls back to the standard SCT rail where the payment meets standard-SCT eligibility criteria. If fallback is not possible, the payment is returned to the customer.

## Impact
Payments that fall back to standard SCT lose the instant delivery promise, which may breach customer expectations. Where fallback is not possible, the customer must resubmit.

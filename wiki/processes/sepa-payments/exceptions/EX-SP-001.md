---
id: EX-SP-001
type: exception
section: exceptions
title: Invalid IBAN/BIC or incomplete instruction
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
category: data-quality
impact: LOW
handlingOwner: Payments Operations
provenance: {"Description": {"evidence": "Step 2: 'Creditor IBAN structure and check digits are valid. The creditor bank is reachable in the SEPA scheme directory. Mandatory fields are present; the remittance reference is well-formed.'", "source": "document"}, "Handling": {"evidence": "Section 6 E-1: 'Payment rejected to the customer with a reason code; correction and resubmission required.'", "source": "document"}, "Impact": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:00Z
---
## Description
The payment instruction fails validation because the creditor IBAN is structurally invalid, the BIC is unrecognised in the SEPA scheme directory, or one or more mandatory fields are absent or malformed.

## Handling
The payment is rejected and returned to the customer with a reason code. The customer must correct the instruction and resubmit.

## Impact
Minimal financial impact — the payment never progresses to booking. The customer experiences a delay equal to the correction and resubmission cycle.

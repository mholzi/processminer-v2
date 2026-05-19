---
id: EX-SPP-001
type: exception
section: exceptions
title: Invalid IBAN/BIC or incomplete instruction
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
category: Validation
impact: MEDIUM
provenance: {"Description": {"evidence": "Invalid IBAN/BIC or incomplete instruction", "source": "document"}, "Handling": {"evidence": "Payment rejected to the customer with a reason code; correction and resubmission required.", "source": "document"}, "Impact": {"evidence": "Payment rejected to the customer with a reason code; correction and resubmission required.", "source": "document"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-18
---
## Description
An instruction fails validation because the IBAN or BIC is invalid or mandatory fields are incomplete. It is detected at the validate-instruction step before the payment proceeds.

## Handling
The payment is rejected back to the customer with a reason code. The customer must correct the instruction and resubmit it for the payment to proceed.

## Impact
The payment does not execute on the original attempt; the customer is delayed until they correct and resubmit the instruction.

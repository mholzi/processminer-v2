---
id: PS-SP-002
type: process-step
section: process-steps
title: Validate instruction
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
owner: Payments Operations
sla:
condition: Payment instruction has been received and queued in the payment hub
systems: [SYS-SP-002]
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:15Z
---
## What happens
The payment hub runs five automated checks against every instruction: (1) creditor IBAN structure and check digits are valid; (2) the creditor bank is reachable in the SEPA scheme directory; (3) currency is EUR and the creditor country is in the SEPA zone; (4) mandatory fields are present and the remittance reference is well-formed; (5) the instruction is not a duplicate of one seen in the last 24 hours. All five checks must pass for the instruction to proceed. Any failure routes the instruction to Exception E-1.

## Inputs
- Payment instruction record from Step 1
- SEPA scheme directory (creditor bank reachability data)
- Duplicate-payment detection log (24-hour window)

## Outputs
- Validated instruction cleared to proceed to funds check
- Rejection notification to customer with reason code (on failure)

## Why it matters
Catching malformed or unreachable instructions before funds are touched prevents failed payments, reduces R-transaction volumes, and satisfies the SEPA rulebook requirement that only valid, complete credit-transfer instructions enter the clearing chain.

---
id: CP-SP-009
type: control
section: controls
title: IBAN and BIC validation
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
controlType: PREVENTIVE
execution: AUTOMATED
effectiveness: HIGH
owner: Payment Operations
step: [PS-SP-002]
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:15Z
---
## What it checks
Verifies that the creditor IBAN structure and check digits are valid, that the creditor bank BIC is reachable in the SEPA scheme directory, that the currency is EUR and the creditor country is within the SEPA zone, and that mandatory fields are present and well-formed.

## Control activity
The Payment Hub runs automated validation against the SEPA scheme directory on every incoming payment instruction before any funds check or screening step. Instructions that fail IBAN structure, check-digit, or scheme-directory lookups are immediately rejected with a reason code.

## Risk addressed
Payments sent to invalid or unreachable accounts, resulting in failed settlement, client compensation claims, and processing rework.

## Timing
Runs on every item at instruction receipt, before funds check, sanctions screening, or routing.

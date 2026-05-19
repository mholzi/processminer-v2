---
id: PS-SPP-002
type: process-step
section: process-steps
title: Validate instruction
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
owner: Payment Hub
systems: [SYS-SPP-002]
provenance: {"Inputs": {"evidence": "correct — a beneficiary name check is performed at validation today", "source": "elicited"}, "Outputs": {"evidence": "If validation fails -> see Exception E-1. ... Payment rejected to the customer with a reason code", "source": "document"}, "What happens": {"evidence": "correct — a beneficiary name check is performed at validation and a negative result rejects to the customer the same way as the other validation failures; all listed failure modes are valid validation reasons", "source": "elicited"}, "Why it matters": {"evidence": "correct — all listed failure modes (duplicate, non-EUR, non-SEPA country, unreachable bank, name mismatch) are valid validation reasons and all reject to the customer", "source": "elicited"}}
transitions: [PS-SPP-003|normal|when the instruction is valid and complete, EX-SPP-001|exception|when validation fails]
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-18
---
## What happens
The payment hub validates the instruction. It checks that the creditor IBAN structure and check digits are valid, that the creditor bank is reachable in the SEPA scheme directory, that the currency is EUR and the creditor country is in the SEPA zone, that all mandatory fields are present and the remittance reference is well-formed, that the beneficiary name check returns a match, and that the instruction is not a duplicate of one seen in the last 24 hours. Any check that fails rejects the instruction back to the customer under Exception E-1.

## Inputs
- Payment instruction received from the channel
- SEPA scheme directory of reachable creditor banks
- Beneficiary name-check (Verification of Payee) data
- The last 24 hours of processed instructions for duplicate comparison

## Outputs
- Validated payment instruction passed to the funds check
- Rejection with a reason code where validation fails

## Why it matters
Invalid IBANs, unreachable banks, out-of-scope currencies and countries, malformed references, beneficiary name mismatches and duplicate instructions are all caught and rejected to the customer here under Exception E-1, rather than failing later in clearing.

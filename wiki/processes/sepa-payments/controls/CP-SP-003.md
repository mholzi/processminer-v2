---
id: CP-SP-003
type: control
section: controls
title: Funds and limit check
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
controlType: PREVENTIVE
execution: AUTOMATED
effectiveness: HIGH
owner: Payment Operations
step: [PS-SP-003]
provenance: {"Control activity": {"evidence": "Step 3 describes funds check and earmarking; E-2: 'Single payments rejected; bulk-file items queued to next cycle and the customer notified.' Section 8: Core Banking System handles 'Account balances, holds, debit booking.' Phrase 'in real time' removed — not stated in the document.", "source": "document"}, "Risk addressed": {"evidence": "", "source": "proposed"}, "Timing": {"evidence": "Step sequence: step 2 (validation) -> step 3 (funds check) -> step 4 (sanctions/AML); Section 7 C-3: 'Every item'.", "source": "document"}, "What it checks": {"evidence": "Step 3: 'The debtor account is checked for available balance including intraday limits; the amount is earmarked on the account.'", "source": "document"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:00Z
---
## What it checks
Verifies that the debtor account holds sufficient available balance, inclusive of intraday limits, to cover the payment amount, and earmarks the funds before any downstream processing step.

## Control activity
The Payment Hub queries the Core Banking System to obtain the debtor's available balance and intraday limit position. If sufficient, the payment amount is earmarked on the account. Instructions where funds are insufficient are rejected for single payments or queued to the next cycle for bulk-file items.

## Risk addressed
Overdraft or unsecured credit exposure arising from debiting an account that lacks sufficient cleared funds.

## Timing
Runs on every item immediately after successful instruction validation, before sanctions and AML screening.

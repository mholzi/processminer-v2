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

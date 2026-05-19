---
id: CP-SPP-003
type: control
section: controls
title: Funds & limit check before debit
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
controlType: PREVENTIVE
execution: AUTOMATED
owner: Payments Operations
step: [PS-SPP-003]
provenance: {"Control activity": {"evidence": "The debtor account is checked for available balance including intraday limits; the amount is earmarked on the account.", "source": "document"}, "Risk addressed": {"evidence": "", "source": "proposed"}, "Timing": {"evidence": "Funds & limit check before debit | Preventive / automated | Every item", "source": "document"}, "What it checks": {"evidence": "Funds & limit check before debit ... checked for available balance including intraday limits", "source": "document"}}
---
## What it checks
That the debtor account has sufficient available balance, including intraday limits, before the payment is debited.

## Control activity
The payment hub checks available balance and intraday limits and earmarks the amount on the account before debit booking.

## Risk addressed
Without it, accounts could be debited without cover, creating unauthorised overdrafts and settlement risk.

## Timing
Runs automatically on every payment item at the funds-check step.

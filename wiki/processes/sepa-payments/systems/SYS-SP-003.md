---
id: SYS-SP-003
type: system
section: systems
title: Core Banking System
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
provenance: {"Purpose": {"evidence": "§8 Systems & Data: 'Core Banking System | Account balances, holds, debit booking'; §5.1 step 3: 'The debtor account is checked for available balance including intraday limits; the amount is earmarked on the account'; step 7: 'The customer account is debited and the held amount released into the payment'", "source": "document"}, "Role in this process": {"evidence": "§5.1 step 3: 'The debtor account is checked for available balance including intraday limits; the amount is earmarked on the account'; step 7: 'The customer account is debited and the held amount released into the payment'", "source": "document"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:06:55Z
systemType: CORE
---
## Purpose
Manage customer account records, available balances, intraday limit positions, and debit bookings.

## Role in this process
Used at the funds-check step to verify available balance including intraday limits and to earmark the payment amount on the account. At the debit-booking step it posts the debit entry and releases the hold into the payment.

---
id: CP-SPP-002
type: control
section: controls
title: Duplicate-payment detection
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
controlType: PREVENTIVE
execution: AUTOMATED
owner: Payments Operations
step: [PS-SPP-002]
provenance: {"Control activity": {"evidence": "It's a hard block — a flagged duplicate is rejected under E-1; the customer who genuinely wants the repeat contacts Payments Operations who release it manually.", "source": "elicited"}, "Risk addressed": {"evidence": "Risk wording is fine — confirm it.", "source": "elicited"}, "Timing": {"evidence": "Duplicate-payment detection | Preventive / automated | Every item", "source": "document"}, "What it checks": {"evidence": "A duplicate is the same debtor account, creditor IBAN, amount and remittance reference within the rolling 24-hour window.", "source": "elicited"}}
approval: in-progress
---
## What it checks
Whether the instruction duplicates one already seen in the rolling 24-hour window — the same debtor account, creditor IBAN, amount and remittance reference.

## Control activity
The payment hub compares each instruction against those processed in the preceding rolling 24 hours, matching on debtor account, creditor IBAN, amount and remittance reference. A match is rejected under Exception E-1; a customer intending the repeat must contact Payments Operations for a manual release. There is no self-service override.

## Risk addressed
Without it, a customer or a bulk file could be debited twice for the same payment — for example when an instruction is resubmitted after an uncertain outcome.

## Timing
Runs automatically on every payment item during validation.

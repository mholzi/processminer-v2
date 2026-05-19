---
id: CP-SPP-004
type: control
section: controls
title: Sanctions & AML screening
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
controlType: PREVENTIVE
execution: AUTOMATED
owner: Compliance
step: [PS-SPP-004]
provenance: {"Control activity": {"evidence": "Debtor and creditor are screened against sanctions lists; the payment is checked by AML transaction monitoring ... potential hits route to Compliance.", "source": "document"}, "Risk addressed": {"evidence": "", "source": "proposed"}, "Timing": {"evidence": "Sanctions & AML screening | Preventive / automated | Every item", "source": "document"}, "What it checks": {"evidence": "Sanctions & AML screening", "source": "document"}}
---
## What it checks
That neither party nor the payment matches a sanctions list or shows money-laundering indicators.

## Control activity
Debtor and creditor are screened against sanctions lists and the payment is checked by AML transaction monitoring, with potential hits routed to Compliance.

## Risk addressed
Without it, the bank could process a payment to a sanctioned party or facilitate money laundering, breaching regulation.

## Timing
Runs automatically on every payment item before routing.

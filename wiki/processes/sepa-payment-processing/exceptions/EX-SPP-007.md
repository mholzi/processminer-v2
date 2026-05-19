---
id: EX-SPP-007
type: exception
section: exceptions
title: Missed cut-off
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
category: Cut-off
impact: LOW
provenance: {"Description": {"evidence": "Missed cut-off ... The standard-SCT cut-off for same-cycle processing is 16:00 CET.", "source": "document"}, "Handling": {"evidence": "Standard SCT rolls to the next cycle / next business day; customer informed of the revised execution date.", "source": "document"}, "Impact": {"evidence": "Standard SCT rolls to the next cycle / next business day; customer informed of the revised execution date.", "source": "document"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-18
---
## Description
A standard SCT payment is not ready before the 16:00 CET cut-off, so it cannot make the current processing cycle.

## Handling
The standard SCT rolls to the next cycle or next business day, and the customer is informed of the revised execution date.

## Impact
The payment executes a cycle or a business day later than intended, and the customer's expected execution date moves.

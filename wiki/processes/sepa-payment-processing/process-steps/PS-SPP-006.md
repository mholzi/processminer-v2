---
id: PS-SPP-006
type: process-step
section: process-steps
title: Routing decision
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
owner: Payment Hub
systems: [SYS-SPP-002]
provenance: {"Inputs": {"evidence": "y — confirmed the EUR 100,000 instant limit is a bank-set risk limit", "source": "elicited"}, "Outputs": {"evidence": "The hub selects the rail ... Standard SCT otherwise, or if the SCT Inst attempt is declined.", "source": "document"}, "What happens": {"evidence": "y — confirmed the EUR 100,000 instant limit is a bank-set risk limit, not a scheme maximum", "source": "elicited"}, "Why it matters": {"evidence": "Missed cut-off | Standard SCT rolls to the next cycle / next business day; customer informed of the revised execution date.", "source": "document"}}
transitions: [PS-SPP-007|normal|, EX-SPP-007|exception|when the standard-SCT cut-off is missed]
approval: approved
approvalBy: Markus
approvalDate: 2026-05-18
---
## What happens
The hub selects the clearing rail. It routes to SCT Inst when the amount is at or below the bank-set instant limit — currently EUR 100,000 — the customer elected instant, and the creditor bank is instant-reachable; otherwise, or when an SCT Inst attempt is declined, it routes to standard SCT. The standard-SCT cut-off for same-cycle processing is 16:00 CET.

## Inputs
- Cleared payment instruction
- Payment amount and the customer's instant-or-standard election
- Bank-set instant limit (currently EUR 100,000)
- Creditor bank instant-reachability status

## Outputs
- Payment routed to the SCT Inst or standard SCT rail
- Rail selection recorded for clearing submission

## Why it matters
Choosing the right rail decides the speed and reachability of the payment; items that miss the 16:00 CET cut-off roll to the next cycle under Exception E-7.

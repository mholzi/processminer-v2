---
id: PS-SPP-003
type: process-step
section: process-steps
title: Funds check & hold
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
owner: Payment Hub
systems: [SYS-SPP-002, SYS-SPP-003]
provenance: {"Inputs": {"evidence": "a held payment released downstream loops back to the funds check — confirmed Y", "source": "elicited"}, "Outputs": {"evidence": "the amount is earmarked on the account. If funds are insufficient -> see Exception E-2.", "source": "document"}, "What happens": {"evidence": "if a payment is held later in the process and then sent back it loops back to funds check; intraday limit is a credit line the customer can draw against — confirmed Y", "source": "elicited"}, "Why it matters": {"evidence": "a held payment can sit before release and loops back here for a fresh funds check — confirmed Y", "source": "elicited"}}
transitions: [PS-SPP-004|normal|when funds are sufficient, EX-SPP-002|exception|when funds are insufficient]
approval: approved
approvalBy: Markus
approvalDate: 2026-05-18
---
## What happens
The debtor account is checked for available balance — including any intraday credit limit the customer may draw against — and the payment amount is earmarked, placed on hold, so it cannot be spent twice before the payment is booked. The funds check also re-runs on any payment that was held downstream — for example after a sanctions or fraud hold — and then released: such a payment loops back to this step for a fresh funds check and re-earmark.

## Inputs
- Validated payment instruction
- Debtor account balance and intraday credit limit
- A payment released after a downstream hold (sanctions or fraud), looped back for a fresh check

## Outputs
- Earmarked hold placed on the debtor account
- Instruction passed to sanctions and AML screening

## Why it matters
Confirming cover and earmarking the funds before screening and booking prevents the account being debited without balance; insufficient funds route to Exception E-2. Because a held payment can sit for hours or days before release, re-checking it here ensures it is never booked against stale cover.

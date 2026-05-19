---
id: INT-DDMM-006
type: integration
section: integrations
title: Payment Hub to MMS — R-Transaction Forwarding
status: draft
confidence: high
source: ddmm-it-architect
systems: [SYS-DDMM-003, SYS-DDMM-002]
provenance: {"What connects": {"evidence": "SME (M. Vogel) confirmed: one-directional — Payment Hub receives inbound R-transactions from the payment scheme and forwards them to MMS to trigger Step 7 handling.", "source": "elicited"}, "What flows": {"evidence": "SME confirmed: R-transaction message (UMR, reason code MD01/MD02/AC04/SL01, debtor bank details) plus original collection/transaction reference (scheme R-messages carry the originating transaction reference).", "source": "elicited"}}
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## What connects
One-directional forwarding path from the Payment Hub to the Mandate Management System; inbound R-transactions received from the payment scheme are forwarded to MMS to trigger the R-transaction handling flow.

## What flows
- R-transaction message (referencing UMR, reason code: MD01 / MD02 / AC04 / SL01, debtor bank details)
- Original collection reference linking the R-transaction to the triggering collection attempt

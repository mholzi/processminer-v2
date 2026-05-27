---
id: PS-SP-006
type: process-step
section: process-steps
title: Routing decision
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
owner: Payment Hub
sla: Standard SCT cut-off 16:00 CET
condition: Payment instruction has passed sanctions/AML screening and fraud scoring
systems: [SYS-SP-002]
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:15Z
---
## What happens
The Payment Hub evaluates three criteria to select the clearing rail. SCT Inst is selected when the amount is at or below EUR 100,000, the customer has elected instant, and the creditor bank is instant-reachable. Standard SCT is used in all other cases, or as a fallback if an SCT Inst attempt is declined. For standard SCT, the same-cycle cut-off is 16:00 CET; instructions received after that time roll to the next business day.

## Inputs
- Validated and screened payment instruction
- Customer rail preference (instant or standard)
- Payment amount in EUR
- Creditor bank instant-reachability status
- Current clock time relative to the 16:00 CET cut-off

## Outputs
- Rail selection: SCT Inst or standard SCT
- Cut-off breach flag if applicable

## Why it matters
Choosing the wrong rail risks missing the 10-second settlement window of SCT Inst or causing a failed instant attempt that delays payment. The cut-off gate prevents same-day failures for standard SCT by rolling late instructions to the next business day and informing the customer.

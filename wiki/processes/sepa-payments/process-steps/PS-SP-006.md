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
provenance: {"Inputs": {"evidence": "", "source": "proposed"}, "Outputs": {"evidence": "", "source": "proposed"}, "What happens": {"evidence": "Step 6: 'The hub selects the rail: SCT Inst if the amount is at or below the instant limit (currently EUR 100,000), the customer elected instant, and the creditor bank is instant-reachable. Standard SCT otherwise, or if the SCT Inst attempt is declined. The standard-SCT cut-off for same-cycle processing is 16:00 CET.'", "source": "document"}, "Why it matters": {"evidence": "Step 9 / SLA table: SCT Inst settles within 10 seconds. Exception E-5: SCT Inst timeout or beneficiary-bank rejection. Exception E-7: Missed cut-off — rolls to next cycle / next business day; customer informed of revised execution date.", "source": "document"}}
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

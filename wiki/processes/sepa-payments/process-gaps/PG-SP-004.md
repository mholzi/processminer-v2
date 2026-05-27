---
id: PG-SP-004
type: process-gap
section: process-gaps
title: SCT Inst availability hours not confirmed
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
area: As-Is process
gapStatus: open
affects: [PS-SP-006, PS-SP-009]
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:00Z
---
## The gap
The document describes SCT Inst as settling within 10 seconds but does not confirm whether the bank offers the service continuously — 24 hours a day, 7 days a week, including weekends and public holidays. The availability window for instant payments is a key routing parameter not captured in the current As-Is description.

## Impact
If SCT Inst is not available 24/7, the routing decision (ps-6) must fall back to standard SCT during off-hours, and the settlement and confirmation step (ps-9) must handle the resulting delay and customer notification differently. Target-state availability commitments and SLA definitions cannot be set without this information.

## Next step
Confirm with the SME whether the bank's SCT Inst offering operates 24/7/365 or has a defined maintenance or exclusion window. Document the availability hours and add them to the routing-decision and settlement steps.

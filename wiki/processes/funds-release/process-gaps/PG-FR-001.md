---
id: PG-FR-001
type: process-gap
section: process-gaps
title: No duplicate-request detection at receipt
status: draft
confidence: high
source: Foundational run deep dive — Markus Holzhauser
area: Controls
gapStatus: open
affects: [PS-FR-001]
---
## The gap
The Receive request step has no check for duplicate drawdown requests. Duplicate requests are queued and processed like any other item, with nothing at receipt or validation flagging that the same release has already been raised.

## Impact
Duplicate items consume rework and can result in the same funds being released twice, an error typically caught only afterward by the daily reconciliation control.

## Next step
Introduce a duplicate-detection check at receipt or validation, so repeated requests for the same release are flagged before processing.

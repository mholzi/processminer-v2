---
id: PG-FR-008
type: process-gap
section: process-gaps
title: Treasury confirmation manually re-keyed — no SYS-FR-001 / SYS-FR-004 integration
status: draft
confidence: high
source: SME interview - M. Berger
area: IT Architecture
gapStatus: open
affects: [SYS-FR-001, SYS-FR-004]
---
## The gap
There is no system integration between the Treasury liquidity platform (SYS-FR-004) and the payments workflow tool (SYS-FR-001). Treasury manually re-keys the funding-confirmation outcome as a 'confirmed' flag in the workflow item.

## Impact
The confirmation lives in SYS-FR-004 while the flag that gates the release is set by hand in SYS-FR-001, so a re-key error or omission can let a release proceed without a genuine Treasury confirmation, or block a confirmed one.

## Next step
Integrate SYS-FR-004 and SYS-FR-001 so the funding confirmation flows automatically into the workflow item, removing the manual re-key.

---
id: PG-FR-001
type: process-gap
section: process-gaps
title: Treasury threshold FX conversion rate and evaluation point undefined
status: draft
confidence: high
source: funds-release-dtp-mockup.md
area: Liquidity confirmation
gapStatus: open
affects: [PS-FR-005]
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-18
---
## The gap
A fixed EUR 5,000,000 Treasury threshold, FX-converted at the release-day rate for non-EUR currencies. Undefined: which FX rate source and timestamp is used, at which step the threshold test is evaluated, and whether it is re-tested if the rate moves between PS-FR-004 and PS-FR-005.

## Impact
A borderline non-EUR release near EUR 5m could fall either side of the threshold depending on the rate chosen or the moment it is tested, risking inconsistent application of the Treasury funding-confirmation control.

## Next step
Confirm with the Head of Payment Operations which FX rate source and timestamp is used, and at which step the threshold test is evaluated.

---
id: EX-FR-003
type: exception
section: exceptions
title: Insufficient funding for value date
status: draft
confidence: high
source: funds-release-dtp-mockup.md
category: Funding
impact: MEDIUM
handlingOwner: Treasury
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-17
---
## Description
Treasury finds that funding is not available for the requested value date when confirming a release at or above the threshold.

## Handling
The release is deferred and Treasury picks the next available value date. Treasury and the front office are notified. The SLA clock pauses for the deferral, as for EX-FR-001 and EX-FR-002, so a funding constraint does not penalise M-FR-002 or M-FR-003. When the rescheduled date arrives the item re-enters at PS-FR-005 for a Treasury confirmation, then proceeds to PS-FR-006.

## Impact
Delays the release to a later value date set by Treasury, with Treasury and the front office notified of the rescheduling.

---
id: EX-FR-001
type: exception
section: exceptions
title: Incomplete or invalid request
status: draft
confidence: high
source: funds-release-dtp-mockup.md
category: Operational
handlingOwner: Front Office
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-17
---
## Description
The release request fails validation. It arises when the facility ID is missing or not in 'Active' status, the amount exceeds the available limit, the value date is not a valid business day, or supporting documents are missing.

## Handling
The item is returned to the front office with a reason code and must be resubmitted. The SLA clock pauses while the item sits with the front office.

## Impact
Delays the release until the request is corrected and resubmitted; the paused SLA clock keeps the rework time outside the measured service level.

---
id: EX-FR-001
type: exception
section: exceptions
title: Incomplete or invalid request
status: draft
confidence: high
source: funds-release-dtp-mockup.md
category: Validation
impact: LOW
handlingOwner: Originator
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-17
---
## Description
The release request is incomplete or fails validation — e.g. a missing supporting document, an expired or in-default facility, an amount exceeding the available limit, or a malformed or invalid value date. A non-business-day value date is not a trigger here; it is the ad hoc decision captured in PG-FR-004.

## Handling
The item is returned to the originator with a reason code and must be resubmitted; the SLA clock pauses while it sits with the originator. A suspended or under-review facility is not handled here — it is informally bounced to the front office to clarify with Credit, with no exception logged (see PG-FR-006).

## Impact
Delays the release until a corrected request is resubmitted; the paused SLA clock means the delay does not count against service-level targets.

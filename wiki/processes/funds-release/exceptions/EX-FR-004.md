---
id: EX-FR-004
type: exception
section: exceptions
title: Approver unavailable / 4-eyes breach
status: draft
confidence: high
source: funds-release-dtp-mockup.md
category: Approval
impact: LOW
handlingOwner: Operations Team Lead
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-17
---
## Description
The nominated second-line approver is unavailable, or proceeding would breach the 4-eyes principle — the latter arises when the only approver available for the item is the same Operations Analyst who gave its first-line approval, which would put one person on both control lines.

## Handling
The item is parked and escalated to the Operations Team Lead (ROLE-FR-006), who reassigns the second-line approval to an eligible approver. Reassignment works only when one exists; where both nominated approvers are absent the target is undefined (see PG-FR-002). The SLA clock keeps running while the item is parked, so this internal staffing delay counts against the turnaround metrics.

## Impact
Delays second-line approval and the release until the parked item is reassigned; because the SLA clock keeps running, the delay counts against the turnaround metrics.

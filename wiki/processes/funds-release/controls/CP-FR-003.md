---
id: CP-FR-003
type: control
section: controls
title: Segregation of duties (4-eyes)
status: draft
confidence: high
source: funds-release-dtp-mockup.md
controlType: PREVENTIVE
execution: MANUAL
effectiveness: LOW
owner: Payment Operations
step: [PS-FR-006]
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-17
---
## What it checks
That a non-STP or exception release is authorised by two independent people and not by a single individual. STP-eligible clean items are exempt — they receive a system-applied approval.

## Control activity
On a non-STP or exception item a separate Operations Approver, who must not be the analyst who gave first-line approval, independently and substantively reviews and authorises the release. STP-eligible clean items receive a system second-line approval with no second human.

## Risk addressed
A single person both initiating and authorising a release, allowing fraud or error to pass unchecked.

## Timing
Performed on every non-STP and exception release item at the second-line approval step; STP-eligible clean items are not subject to a human 4-eyes — see control gap CG-FR-001.

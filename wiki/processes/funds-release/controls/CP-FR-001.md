---
id: CP-FR-001
type: control
section: controls
title: Limit check against available facility
status: draft
confidence: high
source: funds-release-dtp-mockup.md
controlType: PREVENTIVE
execution: AUTOMATED
owner: Payment Operations is accountable for the control rule; the Facility Management System owner is accountable for the integrity of the limit data the check reads
step: [PS-FR-002]
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-17
---
## What it checks
That the requested release amount does not exceed the available undrawn limit on the corporate credit facility, as read at validation.

## Control activity
An automated check compares the requested amount against the available limit held in the facility management system during validation. The check is point-in-time: the available limit is not decremented when a release is approved, and the check is not re-run at execution.

## Risk addressed
Releasing funds beyond the facility's approved limit and creating an unauthorised credit exposure.

## Timing
Runs automatically on every release item once, during validation; it is not repeated at execution — see control gap CG-FR-002.

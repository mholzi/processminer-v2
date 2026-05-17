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
step: PS-FR-002
---
## What it checks
That the requested release amount does not exceed the available undrawn limit on the approved corporate credit facility.

## Control activity
An automated, preventive check compares the requested amount against the facility's available limit during request validation, using data from the Facility Management System.

## Risk addressed
A release that draws more than the approved credit facility allows.

## Timing
Runs automatically on every release item during validation.

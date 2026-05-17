---
id: PS-FR-008
type: process-step
section: process-steps
title: Confirm & close
status: draft
confidence: high
source: funds-release-dtp-mockup.md
sequence: 8
owner: Ops Analyst
systems: [SYS-FR-001]
transitions: [PS-FR-009|branch|facility near limit]
---
## What happens
A confirmation is sent to the front office and the workflow item is closed. The audit log records all actors and timestamps involved in the release.

## Inputs
- The posted fund movement
- Actor and timestamp data captured by the payments workflow tool

## Outputs
- A release confirmation sent to the front office
- A closed workflow item
- A complete audit trail of actors and timestamps

## Why it matters
Closing the item with a confirmation and a complete audit trail gives the front office certainty and leaves an evidence record for control and audit review.

---
id: PS-FR-006
type: process-step
section: process-steps
title: Second-line approval (4-eyes)
status: draft
confidence: high
source: funds-release-dtp-mockup.md
sequence: 6
owner: Ops Approver
systems: [SYS-FR-001]
transitions: [PS-FR-007|normal|authorised, PS-FR-004|loopback|approval not granted, EX-FR-004|exception|approver unavailable]
---
## What happens
A separate Ops Approver independently reviews and authorises the release under the four-eyes principle. The approver must not be the same person who performed first-line approval. If approval is not granted, the item is returned to the Ops Analyst.

## Inputs
- The first-line-approved release request
- Treasury liquidity confirmation, where the threshold applied

## Outputs
- An authorised release cleared for execution
- An item returned to the Ops Analyst where four-eyes approval is not granted

## Why it matters
Independent second-line authorisation enforces segregation of duties, so that no single person can both prepare and release funds.

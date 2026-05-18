---
id: PS-FR-004
type: process-step
section: process-steps
title: First-line approval
status: draft
confidence: high
source: funds-release-dtp-mockup.md
owner: Payments workflow tool applies a system first-line approval on STP-eligible clean items; Operations Analyst gives it manually on non-STP and exception items
systems: [SYS-FR-001]
transitions: [PS-FR-005|branch|when the amount is at or above the EUR 5m threshold, PS-FR-006|branch|when the amount is below the EUR 5m threshold]
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-17
---
## What happens
First-line approval confirms validation passed and screening is clear before the item moves forward. For an STP-eligible clean item the payments workflow tool applies a system first-line approval automatically and records it as such. A non-STP or exception item stops for an Operations Analyst — usually the same analyst who validated it, as no control covers the validate-to-first-line span. An item the second-line 4-eyes step does not grant is routed back by reason; one returned here for a validation or first-line defect is reworked and re-given first-line approval.

## Inputs
- Validated release request with a clear screening result
- The STP-eligibility flag on the item
- An item returned from the second-line 4-eyes step for rework (loopback from PS-FR-006)

## Outputs
- First-line approved release request — system-applied for STP items, analyst-given for non-STP and exception items
- Amount routed on the branch — to liquidity confirmation at or above the EUR 5m threshold, to second-line approval below it
- Reworked and re-approved item where it was returned from the 4-eyes step

## Why it matters
First-line approval confirms the analyst-level checks are complete and forms the first half of the dual-control authorisation. Because no control covers the validate-to-first-line span — typically one analyst — the independent second-line approval is what ultimately enforces segregation of duties.

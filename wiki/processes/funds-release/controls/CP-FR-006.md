---
id: CP-FR-006
type: control
section: controls
title: Audit log completeness review
status: draft
confidence: high
source: funds-release-dtp-mockup.md
controlType: DETECTIVE
execution: MANUAL
effectiveness: LOW
owner: Payment Operations
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-17
---
## What it checks
That the audit log records a complete set of actors and timestamps for each release reviewed. It verifies presence and completeness only — not whether a human approver is present.

## Control activity
A Payment Operations reviewer checks a risk-weighted monthly sample — roughly 25 releases, all those at or above EUR 5m plus a random selection of smaller ones — confirming every step in each sampled release carries a recorded actor and timestamp.

## Risk addressed
Gaps in the audit trail that would undermine traceability and accountability for released funds.

## Timing
Performed monthly on a sample. An incomplete log has no defined resolution or escalation path (see CG-FR-003), and the review does not flag STP releases lacking a human approver (see CG-FR-001).

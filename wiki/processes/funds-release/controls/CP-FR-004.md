---
id: CP-FR-004
type: control
section: controls
title: Treasury funding confirmation above threshold
status: draft
confidence: high
source: funds-release-dtp-mockup.md
controlType: PREVENTIVE
execution: MANUAL
effectiveness: MEDIUM
owner: Treasury
step: [PS-FR-005]
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-18
regulatedBy: [REG-FR-013]
---
## What it checks
That funding is available for the value date before a release at or above the fixed EUR 5,000,000 threshold proceeds — non-EUR amounts FX-converted at the release-day rate.

## Control activity
Treasury manually confirms funding availability for the value date on every release at or above the threshold. The confirmation is a point-in-time check, not an earmark — it does not reserve the funding against the release (see PP-FR-001 and control gap CG-FR-004).

## Risk addressed
Committing funds for a large release that the bank cannot fund on the value date.

## Timing
Performed per item on releases at or above the Treasury threshold. Effectiveness is rated MEDIUM — the point-in-time confirmation can be overtaken before execution (EX-FR-005).

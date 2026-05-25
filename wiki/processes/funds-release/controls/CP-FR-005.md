---
id: CP-FR-005
type: control
section: controls
title: Daily reconciliation of held vs. released balances
status: draft
confidence: high
source: funds-release-dtp-mockup.md
controlType: DETECTIVE
execution: MANUAL
effectiveness: MEDIUM
owner: Payment Operations
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-17
---
## What it checks
That the held-funds balance per the Facility Management System reconciles with the released and posted movements per the Core Banking System across the process.

## Control activity
A Payment Operations analyst reconciles the held-funds balance from the Facility Management System (SYS-FR-005) against the released/posted movements from the Core Banking System (SYS-FR-002) — two independently maintained records. Breaks are investigated by the analyst; timing differences are cleared same-day, anything else escalated to the Operations Team Lead.

## Risk addressed
Undetected discrepancies between held and released balances that point to errors or unauthorised movements.

## Timing
Performed once each business day as a detective reconciliation; a discrepancy can persist for most of a business day before detection. The break-resolution workflow is undocumented — see CG-FR-003.

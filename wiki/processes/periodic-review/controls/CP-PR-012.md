---
id: CP-PR-012
type: control
section: controls
title: Aged-case escalation above SLA
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
controlType: DETECTIVE
execution: AUTOMATED
effectiveness: MEDIUM
owner: Financial Crime Operations
step: [PS-PR-005]
regulatedBy: [REG-PR-001, REG-PR-003]
---
## What it checks
Whether any open KYC case has exceeded its risk-tier SLA without reaching a decision, and whether breaching cases are escalated to a senior owner before the review becomes overdue.

## Control activity
The KYC Case Manager monitors the age of every open case against the applicable SLA (Reviewer Triage SLA: 5 working days from case ready-for-review). Cases that breach the SLA threshold are flagged in a daily aged-case report and automatically escalated to the queue owner.

## Risk addressed
Aged cases without a mechanism for escalation accumulate silently. In the As-Is process there was no KPI on cycle time per risk tier (Gap G-05), contributing to the 18.4 % High-risk overdue rate noted in the Executive Summary.

## Timing
Daily; the Case Manager runs the aged-case check every business day and issues escalation notifications automatically when the SLA threshold is crossed.

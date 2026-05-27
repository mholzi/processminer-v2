---
id: CP-DDMM-001
type: control
section: controls
title: Mandate Data Validation
status: draft
confidence: high
source: ddmm-dtp-mockup.md
controlType: PREVENTIVE
execution: AUTOMATED
owner: Payments Operations
step: [PS-DDMM-002]
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
regulatedBy: [REG-DDMM-001, REG-DDMM-005]
---
## What it checks
Validation scope is request-type-aware: new mandates receive the full check set (UMR uniqueness, IBAN checksum and reachability, active CI, mandate type and sequence); amendments check only changed fields plus UMR/CI; cancellations check UMR existence and status only.

## Control activity
The system automatically validates mandate data against these rules on every submitted request before the item proceeds to sanctions screening.

## Risk addressed
Invalid or incomplete mandate data entering the Mandate Management System, leading to failed collections or unresolvable mandate records.

## Timing
Runs on every mandate request at the point of submission, before any further processing occurs.

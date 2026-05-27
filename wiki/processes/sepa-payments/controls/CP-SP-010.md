---
id: CP-SP-010
type: control
section: controls
title: Duplicate-payment detection
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
controlType: PREVENTIVE
execution: AUTOMATED
effectiveness: HIGH
owner: Payment Operations
step: [PS-SP-002]
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:15Z
---
## What it checks
Checks whether an identical payment instruction has already been received and processed within the past 24 hours.

## Control activity
The Payment Hub performs an automated lookup against a rolling 24-hour window of processed instructions during the validation step. Any instruction matching a prior submission is flagged and rejected before the funds check step.

## Risk addressed
Accidental double-payment due to client resubmission or system retry, causing duplicate debits, reconciliation breaks, and financial loss.

## Timing
Runs on every item during instruction validation, inline with IBAN and BIC checks.

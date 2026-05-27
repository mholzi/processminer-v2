---
id: CP-SP-006
type: control
section: controls
title: 4-eyes release of bulk payment files
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
controlType: PREVENTIVE
execution: MANUAL
effectiveness: HIGH
owner: Payment Operations
step: [PS-SP-008]
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:00Z
---
## What it checks
Ensures that no bulk payment file is submitted to clearing without a second authorised operator approving it, preventing a single person from unilaterally releasing a large batch of payments.

## Control activity
Before a bulk file is submitted to the CSM, a second Ops Approver must review and release it in the payment system. Files without a second approval are held and cannot progress to the clearing step.

## Risk addressed
Unauthorised or erroneous bulk payment release — a single operator error or insider action could dispatch a large volume of incorrect or fraudulent payments.

## Timing
Performed once per bulk file after all per-item controls have passed and immediately before submission to clearing.

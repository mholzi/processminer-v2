---
id: CP-PR-013
type: control
section: controls
title: Sanctions-screen re-run at sign-off
status: draft
confidence: medium
source: periodic-kyc-review-dtp.pdf
controlType: PREVENTIVE
execution: AUTOMATED
effectiveness: HIGH
owner: Screening Svc
step: [PS-PR-006]
regulatedBy: [REG-PR-001, REG-PR-002, REG-PR-003]
---
## What it checks
Whether the client's current sanctions, PEP and adverse-media status is clean at the moment the review decision is recorded, catching any list changes that occurred during the review cycle.

## Control activity
The Screening Service (Dow Jones RC) re-runs a full sanctions, PEP and adverse-media screen immediately before the sign-off decision is recorded in the Case Manager. The screen result and timestamp are written to the Audit Ledger as screening evidence.

## Risk addressed
A client could be added to a sanctions list between the initial pre-fill screen and the point of decision. The re-run at sign-off ensures the decision is made on current list data.

## Timing
Per case, at Step 6 — Sign-off — immediately before the approval decision is recorded.

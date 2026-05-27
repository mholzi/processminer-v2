---
id: CP-BGI-001
type: control
section: controls
title: Four-Eyes Issuance Approval
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
controlType: PREVENTIVE
execution: MANUAL
owner: Trade Finance Manager
step: [PS-BGI-005]
approval: in-progress
regulatedBy: [REG-BGI-003, REG-BGI-005, REG-BGI-010]
---
## What it checks
That all upstream checks (completeness, facility limit, wording review, sanctions) have cleared, that the amount is within delegated authority (TFM up to EUR 2m; above EUR 2m requires Head of Trade Finance co-sign), and that pricing is correct.

## Control activity
A Trade Finance Manager reviews the assembled package and approves issuance; approval is recorded in the Trade Finance System. Above EUR 2 million, the Head of Trade Finance must co-sign — both approvals required. Threshold lowered from EUR 5m (v2 revision); previously TFM held sole authority to EUR 5m.

## Risk addressed
Unauthorised issuance of a guarantee without a responsible manager's review and approval.

## Timing
Performed at step 5 for every guarantee application before issuance proceeds.

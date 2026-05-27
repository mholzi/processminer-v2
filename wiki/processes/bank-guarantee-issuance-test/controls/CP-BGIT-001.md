---
id: CP-BGIT-001
type: control
section: controls
title: Four-eyes issuance approval
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
controlType: PREVENTIVE
execution: MANUAL
owner: Trade Finance Manager
step: [PS-BGIT-005]
approval: in-progress
regulatedBy: [REG-BGIT-004, REG-BGIT-005, REG-BGIT-006]
---
## What it checks
Verifies that every guarantee issuance has been reviewed and approved by a Trade Finance Manager, with approval recorded in the Trade Finance System.

## Control activity
A Trade Finance Manager reviews the assembled guarantee package and approves issuance, recorded in the Trade Finance System. Guarantees above EUR 5 million additionally require sign-off by the Head of Trade Finance.

## Risk addressed
Risk of unauthorised or erroneous guarantee issuance creating unintended bank liability.

## Timing
Executed at Step 5 (Issuance Approval) before the guarantee is generated.

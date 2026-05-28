---
id: CP-BGID-001
type: control
section: controls
title: Four-Eyes Issuance Approval
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
controlType: PREVENTIVE
execution: MANUAL
effectiveness: HIGH
owner: Trade Finance Operations
step: [PS-BGID-005]
regulatedBy: []
updatedBy: the assistant
updatedAt: 2026-05-28T14:13:17Z
approval: approved
approvalBy: admin
approvalDate: 2026-05-28
---
## What it checks
Verifies that every guarantee issuance package has been independently reviewed and approved by a Trade Finance Manager before the guarantee is generated and transmitted.

## Control activity
A Trade Finance Manager reviews the assembled guarantee application package and records an approval in the Trade Finance System before issuance proceeds. Guarantees above EUR 5 million additionally require sign-off by the Head of Trade Finance.

## Risk addressed
Unauthorised or erroneous issuance of a guarantee, resulting in contingent liability being created without appropriate oversight.

## Timing
Runs on every guarantee application immediately before guarantee generation and delivery, as a mandatory gate at PS-BGID-005.

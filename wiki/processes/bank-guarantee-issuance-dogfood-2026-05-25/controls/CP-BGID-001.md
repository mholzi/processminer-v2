---
id: CP-BGID-001
type: control
section: controls
title: Four-Eyes Issuance Approval
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
controlType: PREVENTIVE
execution: HYBRID
owner: Trade Finance
step: [PS-BGID-005]
regulatedBy: [REG-BGID-001]
updatedBy: the assistant
updatedAt: 2026-05-25T20:56:10Z
---
## What it checks
That every guarantee has been reviewed and approved by a Trade Finance Manager before issuance, with the approval recorded in the Trade Finance System.

## Control activity
A Trade Finance Manager reviews the assembled guarantee package and approves issuance in the Trade Finance System. Guarantees above EUR 5 million additionally require sign-off by the Head of Trade Finance.

## Risk addressed
Without this control, a guarantee could be issued without adequate senior review, exposing the bank to unauthorised commitments, credit losses and regulatory censure.

## Timing
Runs once per guarantee application at the issuance approval step, prior to guarantee generation and delivery.

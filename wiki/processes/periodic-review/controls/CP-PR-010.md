---
id: CP-PR-010
type: control
section: controls
title: 4-eyes sign-off on High-risk PEP and exit cases
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
controlType: PREVENTIVE
execution: HYBRID
effectiveness: HIGH
owner: FCO
step: [PS-PR-006]
regulatedBy: [REG-PR-001, REG-PR-002, REG-PR-003, REG-PR-004]
---
## What it checks
Whether every High-risk client review, PEP review, recommend-exit decision, and approve-with-conditions outcome that restricts a regulated product receives a mandatory second sign-off by the Financial Crime Officer before the case closes.

## Control activity
The KYC Case Manager enforces a gate at Step 6: in-scope cases cannot reach Close-out without FCO sign-off recorded against the FCO SSO identity. Sign-off is immutable and written to the Audit Ledger. A random 5 % QA sample of STP and analyst approvals is also routed to FCO review.

## Risk addressed
Without a mandatory second approval gate, High-risk and PEP decisions rest on a single analyst's judgement. The As-Is process had no written escalation rule — a finding raised in internal audit report IA-2025-117.

## Timing
Per case, at Step 6 — Sign-off — for all mandatory-scope cases. The Case Manager blocks Close-out until the FCO gate is satisfied.

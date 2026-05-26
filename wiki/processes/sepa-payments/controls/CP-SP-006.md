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
provenance: {"Control activity": {"evidence": "RACI: Ops Approver is A/R for 'Bulk-file release approval (4-eyes).' Sentence 'The initiating Payments Operations staff member cannot be the same person as the approver' removed — not stated in the document, only inferred from the 4-eyes label.", "source": "document"}, "Risk addressed": {"evidence": "", "source": "proposed"}, "Timing": {"evidence": "Section 7 C-6: 'Per file.' Step sequence places CSM submission at step 8; per-item controls (validation, funds, sanctions, fraud) precede it.", "source": "document"}, "What it checks": {"evidence": "Section 7 C-6: '4-eyes release of bulk payment files, Preventive / manual, Per file.' RACI: 'Bulk-file release approval (4-eyes)' — Ops Approver is A/R.", "source": "document"}}
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

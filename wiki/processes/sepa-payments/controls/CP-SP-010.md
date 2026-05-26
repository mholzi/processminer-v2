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
provenance: {"Control activity": {"evidence": "Step 2: 'The instruction is not a duplicate of one seen in the last 24 hours.' Step sequence (validation at step 2, funds at step 3) establishes rejection before funds earmarking. Specific matching fields (debtor, creditor IBAN, amount, remittance reference) were removed — not stated in the document.", "source": "document"}, "Risk addressed": {"evidence": "", "source": "proposed"}, "Timing": {"evidence": "Duplicate check is listed within step 2 bullet list alongside IBAN/BIC checks; Section 7 C-2: 'Every item'.", "source": "document"}, "What it checks": {"evidence": "Step 2: 'The instruction is not a duplicate of one seen in the last 24 hours.'", "source": "document"}}
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

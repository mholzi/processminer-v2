---
id: CP-PR-011
type: control
section: controls
title: 5% random QA sampling of STP and analyst approvals
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
controlType: DETECTIVE
execution: HYBRID
effectiveness: MEDIUM
owner: QA Team
step: [PS-PR-006]
regulatedBy: [REG-PR-005]
provenance: {"Control activity": {"evidence": "", "source": "proposed"}, "Risk addressed": {"evidence": "[Gap log G-07:] QA sampling ad-hoc, not statistical. Severity: Medium. [§10:] QA pass rate tracked as a KPI.", "source": "document"}, "Timing": {"evidence": "", "source": "proposed"}, "What it checks": {"evidence": "Step 6: a random 5 % QA sample of STP and analyst approvals [is routed to FCO sign-off]. [Evidence column:] QA scorecards.", "source": "document"}}
---
## What it checks
Whether the STP auto-approval logic and analyst approval decisions are consistently sound by testing a statistically designed random sample against the full evidence pack.

## Control activity
The Case Manager randomly flags 5 % of STP and analyst-approved cases for FCO review. The FCO reviews the evidence pack and records pass or fail on a QA scorecard. Results are reported monthly to the Head of Financial Crime Operations and quarterly to the Operational Risk Committee.

## Risk addressed
Without systematic sampling, errors in the STP model or analyst judgement accumulate undetected. The As-Is QA sampling was ad-hoc and not statistically designed (Gap G-07).

## Timing
Per case at Close-out for sampled cases; selection is random and continuous. Aggregate results reviewed monthly with the Head of Financial Crime Operations and quarterly with the Operational Risk Committee.

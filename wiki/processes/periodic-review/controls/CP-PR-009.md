---
id: CP-PR-009
type: control
section: controls
title: Pre-fill completeness threshold for STP
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
controlType: PREVENTIVE
execution: AUTOMATED
effectiveness: HIGH
owner: Financial Crime Operations
step: [PS-PR-003]
regulatedBy: [REG-PR-001, REG-PR-003, REG-PR-005]
provenance: {"Control activity": {"evidence": "", "source": "proposed"}, "Risk addressed": {"evidence": "[§5.1:] AMLD6 (EU 2018/1673) Art. 13(1)(d): Ongoing monitoring + periodic review. BaIT (DE BaFin) AT 4.3: IT-based control execution, evidence completeness.", "source": "document"}, "Timing": {"evidence": "[Table:] Frequency: Per case. [Step 3:] STP Decision Engine evaluates eligibility at Step 3.", "source": "document"}, "What it checks": {"evidence": "Step 3 — STP Decision. Eligibility: Low or Medium risk and completeness ≥ 92 and no open screening hit and no event-based trigger and product mix unchanged.", "source": "document"}}
---
## What it checks
Whether the data completeness score computed at case-open meets the minimum threshold (≥ 92 out of 100) required for a case to be eligible for straight-through processing, and that no open screening hit or event-based trigger exists.

## Control activity
The STP Decision Engine evaluates completeness, risk rating, screening status and product-mix at Step 3. A case passes when all gates clear: Low or Medium risk, completeness ≥ 92, no open screening hit, no active event trigger. Failing cases route to Reviewer Triage with reason stated. Outcomes are audit-logged.

## Risk addressed
Allowing under-documented cases to auto-approve would leave the bank unable to demonstrate adequate ongoing due diligence to supervisors, creating exposure under AMLD6 Art. 13(1)(d) and BaIT AT 4.3 requirements for evidence completeness.

## Timing
Per case, at Step 3 — STP Decision — immediately after case pre-fill completes.

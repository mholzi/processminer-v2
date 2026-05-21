---
id: CP-PR-002
type: control
section: controls
title: Pre-fill completeness ≥ 92 for STP eligibility
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
controlType: PREVENTIVE
execution: AUTOMATED
effectiveness: HIGH
owner: Financial Crime Operations
regulatedBy: [REG-PR-001, REG-PR-002, REG-PR-003]
provenance: {"Control activity": {"evidence": "", "source": "proposed"}, "Risk addressed": {"evidence": "AMLD6 (EU 2018/1673) Art. 13(1)(d): Ongoing monitoring + periodic review. AMLO-FINMA (FINMA-RS 2016/7) §22, §23: Re-verification of identity and beneficial owners. FATF Recommendation 10 (d): Ongoing due diligence. (§5.1)", "source": "document"}, "Timing": {"evidence": "KYC-C-02 Frequency: Per case (§5.2)", "source": "document"}, "What it checks": {"evidence": "", "source": "proposed"}}
---
## What it checks
A case must reach a completeness score of ≥ 92 out of 100 — covering identity documents, address, source-of-funds signal, beneficial-owner graph, and screening results — before it is eligible for straight-through auto-approval.

## Control activity
The case is assigned a completeness score (0–100) at case open. The STP Decision Engine evaluates eligibility at Step 3: Low or Medium risk, completeness ≥ 92, no open screening hit, no event-based trigger, product mix unchanged.

## Risk addressed
Auto-approving reviews with insufficient supporting data, which would breach ongoing due-diligence requirements under AMLD6 Art. 13(1)(d), AMLO-FINMA §22–23, and FATF Recommendation 10.

## Timing
Per case, at the STP decision step (Step 3).

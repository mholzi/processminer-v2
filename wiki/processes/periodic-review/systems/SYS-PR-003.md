---
id: SYS-PR-003
type: system
section: systems
title: STP Decision Engine
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
systemType: CORE
integrates: [SYS-PR-001, SYS-PR-006]
provenance: {"Purpose": {"evidence": "STP Decision Engine … STP eligibility … Build (rules + ML model gate) [§7.2 inventory table]; 'Eligibility. Low or Medium risk and completeness ≥ 92 and no open screening hit and no event-based trigger and product mix unchanged.' [§3.2 Step 3]", "source": "document"}, "Role in this process": {"evidence": "", "source": "proposed"}}
---
## Purpose
Evaluates STP eligibility using a rules layer plus an ML model gate, and auto-approves qualifying Low- and Medium-risk cases.

## Role in this process
Drives Step 3 (STP Decision). Applies eligibility criteria: risk tier Low/Medium, completeness score ≥ 92, no live screening hit, no event-trigger flag, unchanged product mix. Hard-capped at 70 % STP share of the eligible book (Transformation Decision D3).

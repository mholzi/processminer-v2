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
provenance: {"Purpose": {"evidence": "§7.2 table: System 'STP Decision Engine', Role 'STP eligibility', Build 'Build (rules + ML model gate)', Status 'In design'.", "source": "document"}, "Role in this process": {"evidence": "", "source": "proposed"}}
---
## Purpose
Internal-build rules-plus-ML-model gate that evaluates STP eligibility and auto-approves qualifying Low- and Medium-risk cases without human review. Status: In design.

## Role in this process
Executes Step 3 (STP Decision). Auto-approves cases meeting five eligibility conditions (Low/Medium risk, completeness >= 92, no screening hit, no event trigger, product unchanged); otherwise routes to Reviewer Triage with a reason. STP share is hard-capped at 70%.

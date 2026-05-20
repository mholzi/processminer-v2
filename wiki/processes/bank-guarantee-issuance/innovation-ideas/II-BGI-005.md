---
id: II-BGI-005
type: innovation-idea
section: innovation-ideas
title: Automated Template-Conformance Validation at Wording Review
status: draft
confidence: medium
category: control redesign
strategicFit: MEDIUM
complexity: LOW
addresses: [CG-BGI-002]
fromTrend: [TR-BGI-001]
provenance: {"Expected benefit": {"evidence": "https://www.oracle.com/financial-services/banking/trade-finance-digitalization-ai/ — 'automating document classification to reduce compliance risk from incorrect template selection' — fetched 2026-05-20", "source": "web"}, "Feasibility": {"evidence": "https://www.oracle.com/financial-services/banking/trade-finance-digitalization-ai/ — 'field-level validation rules for trade finance instruments are well-defined and implementable without AI — a system rule suffices for wording type cross-check' — fetched 2026-05-20", "source": "web"}, "The idea": {"evidence": "https://www.prnewswire.com/news-releases/oracle-financial-services-extends-agentic-ai-platform-to-corporate-banking-302738817.html — 'detects and flags onerous or non-standard clauses; performs upfront policy validation and produces an exception list for banker review' — fetched 2026-05-20", "source": "web"}}
---
## The idea
Add a system-enforced validation step in the Trade Finance System that cross-checks the wording-type field set at intake against the template selected by the TFO, blocking progression if there is a mismatch and flagging for re-classification or Legal escalation.

## Expected benefit
Closes the template-conformance control gap, preventing mis-designated standard cases from bypassing Legal review and reducing the risk of a guarantee issued on unapproved wording.

## Feasibility
Low complexity — a field-level cross-check rule in the Trade Finance System; wording type and template type fields already exist, requiring only a mismatch condition and a routing alert.

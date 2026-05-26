---
id: IR-BGID-001
type: innovation-risk
section: innovation-risks
title: AI Wording Pre-Screener — AI Model Accuracy on Bespoke Clauses
status: draft
confidence: medium
source: innovation-analyst session 2026-05-26
severity: HIGH
provenance: {"Likelihood & impact": {"evidence": "Elicited from domain analysis; AI hallucination on legal-text classification is a well-documented failure mode", "source": "elicited"}, "Mitigation": {"evidence": "Elicited from standard AI deployment practice for regulated banking contexts", "source": "elicited"}, "The risk": {"evidence": "Elicited from domain analysis of II-BGID-001 delivery risk", "source": "elicited"}}
updatedBy: admin
updatedAt: 2026-05-26T09:56:41Z
approval: in-progress
approvalBy: admin
approvalDate: 2026-05-26
---
## The risk
The LLM clause-screener misclassifies conformant bespoke wording as non-conforming, or passes genuinely non-conforming clauses, producing results that mislead the Legal team or cause a non-conforming clause to bypass review entirely.

## Likelihood & impact
Moderate likelihood given the specificity of bank-guarantee wording conventions; HIGH impact — an undetected non-conforming clause in an issued guarantee creates legal enforceability risk and regulatory exposure for the bank.

## Mitigation
Human-in-the-loop escalation gate for all flagged items; quarterly accuracy benchmarking of model decisions against Legal team outcomes; confidence-threshold floor below which no clause clears without Legal review.

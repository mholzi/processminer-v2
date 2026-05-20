---
id: IR-BGIT-002
type: innovation-risk
section: innovation-risks
title: AI wording assistant accuracy and Legal liability risk
status: draft
confidence: high
source: innovation-analyst — M. Berger, 2026-05-20
severity: MEDIUM
provenance: {"Likelihood & impact": {"evidence": "M. Berger Stage 5 standing input confirmed severity MEDIUM", "source": "elicited"}, "Mitigation": {"evidence": "M. Berger Stage 5 standing input; accuracy/governance risk for II-BGIT-002", "source": "elicited"}, "The risk": {"evidence": "", "source": "proposed"}}
---
## The risk
An AI wording assistant may generate text that appears correct but contains subtle legal inaccuracies — non-standard clauses or ambiguous beneficiary conditions — that Legal has not reviewed. If such a guarantee is dispatched, the bank bears liability for an instrument that does not match its approval intent.

## Likelihood & impact
Likelihood is low for standard ICC wording, higher for bespoke drafting. Impact is potentially severe for individual guarantees but can be bounded by maintaining mandatory Legal sign-off for any AI-generated bespoke wording rather than routing it STP.

## Mitigation
Restrict the AI assistant to flagging deviations from approved ICC templates, not generating bespoke wording autonomously. Require Legal approval for any AI-suggested modification to standard language, and log all AI-generated suggestions for periodic Legal audit.

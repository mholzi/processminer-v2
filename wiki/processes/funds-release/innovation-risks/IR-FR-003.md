---
id: IR-FR-003
type: innovation-risk
section: innovation-risks
title: Agentic AI error or 4-eyes breach
status: draft
confidence: medium
source: SME interview - M. Berger
severity: HIGH
---
## The risk
An agentic-AI agent (II-FR-004, II-FR-007) mis-triages or mis-prepares a payment item, or an agentic assistant meant only to prepare a 4-eyes review drifts into effectively making the approval decision — collapsing the dual-control the assistant was supposed to support.

## Likelihood & impact
Likelihood medium — agentic tooling is immature and boundary drift is a known failure mode. Impact high: a wrong release or a breached 4-eyes control on a funds-release decision is a direct financial-crime and segregation-of-duties exposure.

## Mitigation
Keep agents strictly preparatory with a hard human-in-the-loop boundary at every approval; log and audit every agent action; pilot on low-value items first; and treat the agent's output as advisory input the human approver must independently confirm.

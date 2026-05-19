---
id: TD-CAC-006
type: transformation-decision
section: transformation-decisions
title: Document the dormancy threshold in policy and deploy an AI-driven dormancy monitoring agent
status: draft
confidence: medium
source: M. Berger; source-target synthesis — corporate-account-closure wiki
decisionType: policy-and-automation
decisionStatus: proposed
resolves: [PG-CAC-002]
realises: [TS-CAC-001, TS-CAC-004]
fromIdea: [II-CAC-002]
provenance: {"Options considered": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "Rationale": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "The decision": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}}
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-19
---
## The decision
Define the dormancy threshold (period of inactivity triggering a closure recommendation) in the bank's dormancy policy, then automate threshold monitoring in the Core Banking System — deploying an AI-driven monitoring agent that identifies accounts crossing the threshold and generates a pre-populated closure case for the Closure Analyst.

## Options considered
- Define the threshold in policy and automate detection via an AI-driven Core Banking agent (aligns with TD-CAC-001)
- Define the threshold in policy and enforce through periodic manual dormancy reviews (documented parameter, unchanged workflow)
- Adopt a third-party dormancy management module
- Remove dormancy-triggered closure as an in-scope trigger

## Rationale
Documenting the threshold in policy is a prerequisite regardless of the automation path. The AI-driven detection option aligns with the agentic AI platform decision (TD-CAC-001) and eliminates analyst discretion from the trigger — consistent with ING's agentic KYC redesign (CEU-CAC-001).

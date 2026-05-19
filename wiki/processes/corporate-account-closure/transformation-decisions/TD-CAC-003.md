---
id: TD-CAC-003
type: transformation-decision
section: transformation-decisions
title: Upgrade to AI-enhanced real-time sanctions screening with explainable risk scoring
status: draft
confidence: medium
source: M. Berger; source-target synthesis — corporate-account-closure wiki
decisionType: control-technology
decisionStatus: proposed
resolves: []
realises: [TS-CAC-001]
fromIdea: []
provenance: {"Options considered": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "Rationale": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "The decision": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-19
---
## The decision
Replace or augment the current Sanctions Screening Engine (SYS-CAC-003) with an AI-enhanced engine providing real-time matching, explainable risk scores, and automated audit trail generation, reducing false-positive rates and Compliance adjudication time on closure cases.

## Options considered
- Upgrade the existing engine with an AI/NLP enhancement layer
- Replace with a purpose-built AI screening platform (e.g. Temenos FCM AI Agent, Dow Jones Risk & Compliance)
- Integrate Fiserv agentOS AML Triage module as the adjudication layer on top of the existing screen
- Retain the current engine and accept the current false-positive burden

## Rationale
Regulators increasingly expect real-time explainable screening outputs (TR-CAC-003). Temenos FCM AI Agent achieves less than 2% false positive rates in live deployments. Retaining the current engine increases Compliance staff burden and creates delays on false-positive hits that extend the closure cycle.

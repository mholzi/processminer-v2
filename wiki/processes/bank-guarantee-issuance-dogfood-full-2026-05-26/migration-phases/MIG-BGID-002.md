---
id: MIG-BGID-002
type: migration-phase
section: migration-phases
title: Phase 2 — AI Wording Pre-Screener with EU AI Act Conformity
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
phaseStatus: PLANNED
startQuarter: 2026 Q4
endQuarter: 2026 Q4
owner: Head of Trade Finance Engineering
delivers: [TGTAPP-BGID-002, CAP-BGID-002, CAP-BGID-003]
dependsOn: [MIG-BGID-001]
provenance: {"Acceptance criteria": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Risks": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Scope": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Scope
Builds and deploys the AI Wording Pre-Screener (Classification Inference Service, HITL Review Queue, Model Registry & Audit Log). Completes EU AI Act Annex III conformity assessment and obtains CE marking before go-live. Integrates TFS Wording Orchestrator with the screener via INT-BGID-002. Removes manual wording triage from the TFO queue for standard-wording applications. The five-business-day Legal SLA management for bespoke cases is delivered in this phase.

## Acceptance criteria
- Classification inference P95 latency ≤ 800ms confirmed by production load test
- Human override rate (TFO overriding AI decision) < 25% over the first 30 days of operation
- EU AI Act conformity assessment certificate and CE declaration signed off by Chief Compliance Officer before go-live
- Model Registry and Audit Log capturing every inference with model version and confidence score

## Risks
- EU AI Act conformity assessment duration is uncertain — may push go-live into Q1-2027
- Training corpus for rare guarantee types may be insufficient, requiring an active-learning data collection sprint
- Human override rate exceeding 25% signals model quality below threshold and triggers retraining before proceeding

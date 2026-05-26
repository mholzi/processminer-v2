---
id: MIG-BGID-001
type: migration-phase
section: migration-phases
title: Phase 1 — Smart Intake Portal, ICC-SWIFT API Gateway & Event Bus
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
phaseStatus: PLANNED
startQuarter: 2026 Q3
endQuarter: 2026 Q3
owner: Head of Trade Finance Engineering
delivers: [TGTAPP-BGID-005, CAP-BGID-001, CAP-BGID-009]
resolvesGap: [VG-BGID-001]
provenance: {"Acceptance criteria": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Risks": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Scope": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Scope
Delivers the enhanced Corporate Portal with system-level mandatory field enforcement, the ICC-SWIFT API Gateway for ERP-connected clients, the Application Event Publisher with transactional outbox, and the TFS Intake Subscriber. Establishes the Kafka event bus (bgid.application.received.v1), the DMS Lifecycle Event Sink, and WORM archive infrastructure. Existing TFS capabilities — sanctions screening and four-eyes approval — are retained unchanged. Wording classification remains manual (Phase 2 delivers the AI screener).

## Acceptance criteria
- 100% of guarantee applications submitted via Portal or ICC-SWIFT API without TFO re-entry
- Auto-routing rate for standard-template applications ≥ 60% of total submissions
- All application lifecycle events archived to WORM DMS within 30 seconds of Kafka publication
- Zero incomplete submissions accepted via Portal or API channel (mandatory field enforcement verified by test suite)

## Risks
- ICC-SWIFT API certification timeline may overrun — SWIFT compliance testing is on the critical path
- Kafka event bus infrastructure provisioning on EU-hosted Kubernetes may take longer than planned
- Finastra TI Intake Subscriber configuration may require extended Finastra Professional Services engagement

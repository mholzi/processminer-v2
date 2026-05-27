---
id: COMP-BGID-005
type: component
section: components
title: Human-in-the-Loop Review Queue
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
tech: Python 3.12 / FastAPI
dataStore: PostgreSQL 16 (review queue + decision log)
hosting: EKS eu-central-1 · CPU node pool
scaling: HPA 2→4 replicas
inApp: [TGTAPP-BGID-002]
dependsOn: [COMP-BGID-004]
realisesCapability: [CAP-BGID-003]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Responsibility
Manages the queue of wording classification cases requiring human review — those below the 0.85 confidence threshold and any TFO-overridden cases. Records reviewer decisions with timestamps and rationale for EU AI Act Article 11 audit trail compliance.

## Technical detail
Python 3.12, FastAPI. Review queue and decision log in PostgreSQL 16 (tables: cases, decisions, reviewer_id, decided_at, rationale). Reviewer accesses via internal portal UI. Review decision triggers a REST callback to the TFS Wording Orchestrator. SLA clock monitored via a scheduled polling job. EKS eu-central-1, CPU node pool, HPA 2→4.

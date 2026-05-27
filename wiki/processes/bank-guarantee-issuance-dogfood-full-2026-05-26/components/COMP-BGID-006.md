---
id: COMP-BGID-006
type: component
section: components
title: Model Registry & Audit Log
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
tech: MLflow 2.x / Python
dataStore: PostgreSQL 16 (model metadata) + S3-compatible EU object store (model artefacts, AES-256)
hosting: EKS eu-central-1 · CPU node pool
scaling: N/A — management plane, not on critical path
inApp: [TGTAPP-BGID-002]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Responsibility
Stores all model versions, training run metadata, performance metrics, and per-prediction inference audit logs. Provides the model artefact source of truth for the Classification Inference Service at startup. Required for EU AI Act Article 11 technical documentation.

## Technical detail
MLflow 2.x for experiment tracking and model versioning. Model artefacts (weights, tokenizer) in S3-compatible EU object store (AES-256 at rest). Per-prediction audit log: wording hash, model version, confidenceScore, decision. EKS eu-central-1, CPU node pool. Governance component — no realisesCapability by design; serves EU AI Act Article 11 traceability across TGTAPP-002. Lint finding for the empty realisesCapability link is expected and should not block approval.

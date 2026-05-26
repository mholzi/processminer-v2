---
id: COMP-BGID-004
type: component
section: components
title: Classification Inference Service
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
tech: Python 3.12 / FastAPI / Hugging Face Transformers (fine-tuned BERT)
dataStore: Redis 7 (inference result cache, 5-min TTL)
hosting: EKS eu-central-1 · GPU node pool (g5.xlarge)
scaling: HPA 2→8 replicas · Karpenter GPU autoscale 1→4 nodes
inApp: [TGTAPP-BGID-002]
realisesCapability: [CAP-BGID-002]
provenance: {"Responsibility": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Technical detail": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Responsibility
Serves the POST /v1/classify REST endpoint. Runs the fine-tuned NLP model against guarantee wording text and returns classification (standard or bespoke), templateId, confidenceScore, and a humanReviewRequired flag when confidence falls below the 0.85 threshold.

## Technical detail
Python 3.12, FastAPI, Hugging Face Transformers (fine-tuned BERT-based model). Model artefacts loaded from Model Registry at startup. Redis 7 caches inference results keyed on wording hash (5-min TTL) to avoid duplicate inference on retries. EKS eu-central-1, GPU node pool (g5.xlarge); HPA 2→8 replicas, Karpenter GPU autoscale 1→4 nodes.

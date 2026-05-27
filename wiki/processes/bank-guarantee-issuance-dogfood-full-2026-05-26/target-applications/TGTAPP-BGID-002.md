---
id: TGTAPP-BGID-002
type: target-application
section: target-applications
title: AI Wording Pre-Screener
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
verdict: BUILD
vendor: In-house (fine-tuned NLP model, human-in-the-loop)
owningDomain: Trade Finance
costBand: €200k–500k build + €100k–200k annual run
drivenByADR: [ADR-BGID-002, ADR-BGID-006]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T14:59:49Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Rationale
No commercial NLP product covers URDG 758 demand-guarantee wording with the specificity required. An in-house model trained on the bank's own template library and historical Legal decisions achieves the classification accuracy needed while keeping confidential guarantee text within the bank's EU infrastructure. Human-in-the-loop gates borderline cases, satisfying EU AI Act Annex III conformity requirements.

## Tech stack
Python-based NLP fine-tune on a transformer model, EU-hosted GPU inference cluster, REST API for TFS integration, human review UI served from the internal portal. Training pipeline managed by the bank's AI Centre of Excellence.

## Risks
- EU AI Act Annex III conformity assessment adds an estimated 2–3 months to build timeline
- Model drift over time as wording patterns evolve — requires scheduled retraining
- Low initial training corpus for rare guarantee types may require active-learning bootstrapping
- Human-in-the-loop gate must be technically enforced, not merely procedural

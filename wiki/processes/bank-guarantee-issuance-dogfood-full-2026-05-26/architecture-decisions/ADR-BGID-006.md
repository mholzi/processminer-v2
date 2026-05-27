---
id: ADR-BGID-006
type: adr
section: architecture-decisions
title: EU AI Act Annex III Conformity Assessment for Wording Screener
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
adrStatus: ACCEPTED
owner: Domain Architect
domain: Compliance & Risk / AI Governance
decision: [TD-BGID-002]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T14:59:49Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Context
The AI wording pre-screener classifies guarantee wording and routes applications, contributing to a decision that affects the processing of client financial instruments. Under EU AI Act Article 6 and Annex III point 5(b), AI systems used for creditworthiness assessment or financial-services decision-making may be classified as high-risk. The bank must decide how to classify and govern the wording screener before deployment.

## Decision
Register the AI wording pre-screener as a high-risk system under EU AI Act Annex III, complete the required conformity assessment before deployment, implement technically-enforced human-in-the-loop review for borderline confidence scores, and maintain Article 11 technical documentation across all model versions.

## Alternatives considered
- **Classify as low-risk or general purpose** — rejected: Legal and Compliance assessment is that a system routing client financial-instrument applications warrants Annex III treatment; post-deployment regulatory challenge risk outweighs the timeline saving
- **Limit AI to advisory-only with no routing output** — rejected: defeats TD-BGID-002; manual TFO classification is the As-Is state being replaced
- **Defer conformity assessment to post-deployment audit** — rejected: the bank's AI governance policy mandates pre-deployment conformity assessment for any new AI system regardless of risk tier

## Consequences
- Pre-deployment conformity assessment adds an estimated 2–3 months to build timeline
- Human-in-the-loop gate must be technically enforced, not merely procedural
- Article 11 technical documentation (model card, training data record, performance metrics) must be maintained on every model update
- Ongoing monitoring obligation under EU AI Act Article 72 applies post-deployment

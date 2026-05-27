---
id: ADR-BGID-002
type: adr
section: architecture-decisions
title: Build vs Buy for AI Wording Pre-Screener
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
adrStatus: ACCEPTED
owner: Domain Architect
domain: Trade Finance / AI
decision: [TD-BGID-002]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T14:59:49Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Context
TD-BGID-002 mandates an AI wording pre-screener to classify guarantee wording as standard or bespoke. The bank must choose between procuring a commercial legal NLP tool, building an in-house fine-tuned model, or a rule-based approach. Key constraints are: confidential guarantee text is subject to GDPR; URDG 758 demand-guarantee terminology is a narrow legal domain poorly covered by generic NLP corpora; and the EU AI Act may classify the system as high-risk under Annex III.

## Decision
Build an in-house fine-tuned NLP model trained on the bank's own template library and historical Legal classification decisions, with a mandatory human-in-the-loop gate for borderline confidence scores.

## Alternatives considered
- **Commercial legal NLP (Luminance, Kira Systems)** — rejected: generic legal corpus with no URDG 758 specificity; vendor access to confidential guarantee text introduces GDPR data-transfer risk
- **Commercial trade-finance AI (Traydstream)** — rejected: focused on documentary collections and letters of credit; no demand-guarantee wording classification module available
- **Rule-based template matching only** — rejected: brittle for slightly modified wording; high false-positive bespoke rate defeats the purpose; cannot learn from Legal decisions over time
- **SaaS NLP with EU hosting option** — rejected: acceptable for data residency but requires the same fine-tuning effort as in-house, with an added ongoing vendor dependency

## Consequences
- EU AI Act Annex III conformity assessment required before deployment (see ADR-BGID-006)
- In-house model requires scheduled retraining as wording patterns evolve
- Human-in-the-loop gate must be technically enforced, not merely procedural
- Confidential guarantee text remains within the bank's EU infrastructure

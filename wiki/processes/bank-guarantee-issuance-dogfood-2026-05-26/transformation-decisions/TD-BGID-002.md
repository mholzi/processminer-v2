---
id: TD-BGID-002
type: transformation-decision
section: transformation-decisions
title: Introduce AI wording pre-classifier from shadow mode to live routing
status: draft
confidence: low
source: wiki-synthesis-2026-05-26
decisionType: build/buy
decisionStatus: proposed
resolves: [PP-BGID-002]
realises: [TS-BGID-002]
fromIdea: [II-BGID-002]
updatedBy: admin
updatedAt: 2026-05-26T20:15:01Z
---
## The decision
Deploy an LLM-based wording pre-classifier at intake in shadow mode for two quarters, tracking precision and recall against Legal-reviewed ground truth, before enabling live routing. A human-override path on low-confidence scores remains available throughout.

## Options considered
- Shadow mode phased to live routing with an accuracy gate (chosen).
- Immediate live routing governed by a classifier confidence threshold alone.
- No AI — rely solely on the pre-approved clause library and a formal Legal SLA.

## Rationale
Mis-classification risk (IR-BGID-001) is high-severity: a bespoke clause routed as standard creates an unintended legal obligation. Shadow mode quantifies precision before removing human Legal review, managing the risk without indefinitely delaying the efficiency gain.

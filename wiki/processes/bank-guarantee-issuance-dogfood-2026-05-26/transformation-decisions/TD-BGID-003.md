---
id: TD-BGID-003
type: transformation-decision
section: transformation-decisions
title: Build real-time milestone status in the Corporate Portal
status: draft
confidence: low
source: wiki-synthesis-2026-05-26
decisionType: platform enhancement
decisionStatus: proposed
resolves: []
realises: [TS-BGID-003]
fromIdea: [II-BGID-004]
provenance: {"Options considered": {"evidence": "", "source": "proposed"}, "Rationale": {"evidence": "", "source": "proposed"}, "The decision": {"evidence": "", "source": "proposed"}}
updatedBy: admin
updatedAt: 2026-05-26T20:15:01Z
---
## The decision
Connect TFS status events to the Corporate Portal via an API and display application milestones — intake, credit, wording, screening, approval, delivery — with timestamps to corporate clients and relationship managers within the existing portal interface.

## Options considered
- TFS milestone API consumed by the existing Corporate Portal UI (chosen).
- Email and SMS notifications only, with no portal milestone page.
- Full client self-service portal rebuild with end-to-end visibility.

## Rationale
The Corporate Portal is already the client's channel for guarantee submission. Adding a TFS milestone feed requires only an API and UI change, delivering the visibility benefit without a full portal rebuild that would delay the outcome by 6–12 months.

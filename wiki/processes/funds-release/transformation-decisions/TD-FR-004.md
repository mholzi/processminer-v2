---
id: TD-FR-004
type: transformation-decision
section: transformation-decisions
title: Sequence prerequisites before the STP control layer
status: draft
confidence: medium
source: SME interview - M. Berger
decisionType: Sequencing
decisionStatus: proposed
resolves: [PG-FR-001, PG-FR-004, PG-FR-011]
realises: [TS-FR-003]
fromIdea: [II-FR-005]
---
## The decision
Sequence the transformation so prerequisites land before the work that depends on them: document the STP path and build the currency-aware reference-data engine before the STP automated-control layer, and agree metric definitions before instrumentation.

## Options considered
- Deliver all ideas in parallel for the fastest overall completion
- Sequence prerequisites first, accepting a longer critical path
- Deliver the STP control layer first as the highest-severity item

## Rationale
The STP control layer cannot be built on an undocumented path or unreliable reference data — delivering it early risks a control resting on weak foundations (IR-FR-006). Sequencing prerequisites first lengthens the critical path but ensures each idea lands on a sound base, and each delivers standalone value so a slip degrades rather than blocks the programme (IR-FR-005).

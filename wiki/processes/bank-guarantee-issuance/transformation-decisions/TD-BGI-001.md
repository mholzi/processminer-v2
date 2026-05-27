---
id: TD-BGI-001
type: transformation-decision
section: transformation-decisions
title: Deploy AI Application Intake Validator at Corporate Portal
status: draft
confidence: low
resolves: [PP-BGI-003, CG-BGI-001]
realises: [TS-BGI-001]
fromIdea: [II-BGI-001]
decisionType: build/buy
decisionStatus: proposed
---
## The decision
Deploy an agentic AI intake validator at the Corporate Portal that checks applications for completeness and returns an actionable exception list to the client before the application enters the TFO queue.

## Options considered
- Deploy AI intake validator (Oracle Application Validator Agent or equivalent) at the Corporate Portal
- Extend existing Corporate Portal with rule-based mandatory-field validation only
- Keep current TFO-led manual completeness judgement

## Rationale
AI validator addresses both completeness checking and proactive client notification, closing CG-BGI-001 in a single step. Pure rule-based validation closes the control gap but does not return actionable client feedback. Manual judgement is the current state and the documented cause of PP-BGI-003.

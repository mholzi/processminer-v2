---
id: TD-FR-001
type: transformation-decision
section: transformation-decisions
title: Assure funding and limit by reservation-on-approval
status: draft
confidence: medium
source: SME interview - M. Berger
decisionType: Architecture
decisionStatus: proposed
resolves: [PP-FR-001, CG-FR-002, CG-FR-004, PG-FR-008]
realises: [TS-FR-001]
fromIdea: [II-FR-001, II-FR-002]
---
## The decision
Assure funding and facility-limit availability by reserving them when a release is approved — ring-fencing both against the named release until execution posts it — rather than by re-confirming at execution. One reservation discipline covers the Treasury funding earmark and the facility-limit decrement.

## Options considered
- Re-confirm funding and re-run the limit check at execution, leaving both point-in-time
- Reserve funding and decrement the limit on approval, holding both until the release posts
- Reserve funding only, leaving the facility-limit check unchanged

## Rationale
Re-confirming at execution still leaves a window where assurance can lapse, and treats the funding and limit gaps as separate problems. Reserving on approval makes the assurance hold continuously to the point of release and closes CG-FR-004 and CG-FR-002 with one consistent mechanism; its main cost — idle reserved liquidity — is a tunable risk (IR-FR-002), not a structural flaw.

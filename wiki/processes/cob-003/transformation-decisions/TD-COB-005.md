---
id: TD-COB-005
type: transformation-decision
section: transformation-decisions
title: Move credit assessment to open-banking data
status: draft
confidence: low
source: Consolidated by source-target from the COB-003 wiki
decisionType: TECHNOLOGY
decisionStatus: PROPOSED
resolves: [PP-COB-005]
realises: [TS-COB-003]
fromIdea: [II-COB-008]
provenance: {"Options considered": {"evidence": "", "source": "proposed"}, "Rationale": {"evidence": "", "source": "proposed"}, "The decision": {"evidence": "", "source": "proposed"}}
---
## The decision
Add an open-banking connector to the credit step so a client can permission live bank-account cash-flow data into the scorecard, alongside or in place of the external bureau pull.

## Options considered
- Use permissioned open-banking data as the primary input and the bureau as fallback
- Run open-banking data alongside the bureau pull and compare before switching
- Keep the bureau pull but add status polling and a timeout to make the wait visible
- Leave the credit step unchanged

## Rationale
The bureau integration is fire-and-forget, with a variable response time invisible to the analyst. Open-banking cash-flow data gives a current financial picture and removes the unpredictable wait, but it needs an aggregator integration, consent handling and a scorecard recalibration before it can be trusted as the primary input.

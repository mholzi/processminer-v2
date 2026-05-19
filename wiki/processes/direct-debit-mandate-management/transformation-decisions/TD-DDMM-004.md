---
id: TD-DDMM-004
type: transformation-decision
section: transformation-decisions
title: Add In-Portal Mandate Query Channel
status: draft
confidence: high
source: ddmm-transformation-agent
decisionType: TECHNOLOGY
decisionStatus: DECIDED
resolves: [FP-DDMM-005]
realises: [TS-DDMM-003]
fromIdea: [II-DDMM-008]
provenance: {"Options considered": {"evidence": "SME confirmed options and rationale — accepted without edit.", "source": "elicited"}, "Rationale": {"evidence": "SME confirmed rationale — accepted without edit.", "source": "elicited"}, "The decision": {"evidence": "SME (M. Vogel) accepted all ten decisions without edit.", "source": "elicited"}}
---
## The decision
Add a raise-a-query action in the Creditor Portal on each mandate record, routing structured questions directly into the Payments Operations MMS work queue, with responses delivered in-portal and logged to the mandate activity record.

## Options considered
- Maintain RM relay as the only creditor support route (current state)
- In-portal mandate query channel with direct routing to Payments Operations (chosen)
- Dedicated email or ticket-based support channel (unstructured, unlinked to mandate record)

## Rationale
RM relay adds at least one hand-off and makes response time unpredictable. A generic email or ticket channel is unlinked to the mandate record and creates a separate audit trail. In-portal queries are mandate-scoped, auditable, and route directly to the team that holds the answer without adding a new system.

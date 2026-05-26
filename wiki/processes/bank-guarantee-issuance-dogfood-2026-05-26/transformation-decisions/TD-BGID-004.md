---
id: TD-BGID-004
type: transformation-decision
section: transformation-decisions
title: Migrate SWIFT guarantee delivery to ISO 20022 ahead of November 2027
status: draft
confidence: low
source: wiki-synthesis-2026-05-26
decisionType: regulatory compliance
decisionStatus: proposed
resolves: []
realises: [TS-BGID-004]
fromIdea: [II-BGID-003]
provenance: {"Options considered": {"evidence": "", "source": "proposed"}, "Rationale": {"evidence": "", "source": "proposed"}, "The decision": {"evidence": "", "source": "proposed"}}
updatedBy: admin
updatedAt: 2026-05-26T20:15:01Z
---
## The decision
Migrate PS-BGID-006 SWIFT delivery from MT760 to ISO 20022 guarantee messages, coordinating with the bank-wide ISO 20022 programme, and maintain a tiered MT760 fall-back for beneficiary banks not yet ready for the cut-over.

## Options considered
- Early migration with tiered MT760 fall-back managed by a readiness routing table (chosen).
- Wait for the mandatory November 2027 SWIFT cut-over date before migrating.
- Outsource SWIFT format management to a trade-finance utility bureau.

## Rationale
The November 2027 SWIFT deadline is mandatory — the choice is when, not whether, to migrate. Early migration eliminates the hard-cut crunch risk, surfaces structured wording fields for downstream automation, and phases the beneficiary-bank readiness risk over time rather than concentrating it at the deadline.

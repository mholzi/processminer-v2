---
id: TD-PR-005
type: transformation-decision
section: transformation-decisions
title: One append-only hash-chained audit ledger
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
decisionType: governance
decisionStatus: proposed
resolves: [cg-1, pg-1, pp-5]
provenance: {"Options considered": {"evidence": "Trust SharePoint logs; trust the case manager's internal log.", "source": "document"}, "Rationale": {"evidence": "Closes the BaFin §44 finding decisively. The hash chain makes silent tampering detectable; the external checkpoint defends against insider edits. Cost is low (≤ CHF 60k / year).", "source": "document"}, "The decision": {"evidence": "A single audit ledger for all KYC decisions, append-only, with a Merkle hash chain checkpointed to an external timestamping authority weekly.", "source": "document"}}
---
## The decision
A single audit ledger for all KYC decisions, append-only, with a Merkle hash chain checkpointed to an external timestamping authority weekly.

## Options considered
- Trust SharePoint logs
- Trust the case manager's internal log

## Rationale
Closes the BaFin §44 finding decisively. The hash chain makes silent tampering detectable; the external checkpoint defends against insider edits. Cost is low (at or below CHF 60k per year).

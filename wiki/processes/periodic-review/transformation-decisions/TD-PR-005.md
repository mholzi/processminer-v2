---
id: TD-PR-005
type: transformation-decision
section: transformation-decisions
title: One Audit Ledger — append-only, hash-chained
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
decisionType: audit/compliance
decisionStatus: proposed
resolves: [PP-PR-005, CG-PR-002, CG-PR-004]
provenance: {"Options considered": {"evidence": "", "source": "proposed"}, "Rationale": {"evidence": "Closes the BaFin §44 finding decisively. The hash chain makes silent tampering detectable; the external checkpoint defends against insider edits. Cost is low (≤ CHF 60k / year).", "source": "document"}, "The decision": {"evidence": "A single audit ledger for all KYC decisions, append-only, with a Merkle hash chain checkpointed to an external timestamping authority weekly.", "source": "document"}}
---
## The decision
A single audit ledger for all KYC decisions, append-only, with a Merkle hash chain checkpointed to an external timestamping authority weekly.

## Options considered
- Trust SharePoint logs
- Trust the case manager's internal log

## Rationale
Closes the BaFin §44 finding decisively. The hash chain makes silent tampering detectable; the external checkpoint defends against insider edits. Cost is low (≤ CHF 60k per year).

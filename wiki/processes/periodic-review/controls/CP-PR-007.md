---
id: CP-PR-007
type: control
section: controls
title: Immutable audit ledger of all decisions
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
controlType: DETECTIVE
execution: AUTOMATED
effectiveness: HIGH
owner: Financial Crime Operations
regulatedBy: [REG-PR-001, REG-PR-002, REG-PR-005]
provenance: {"Control activity": {"evidence": "", "source": "proposed"}, "Risk addressed": {"evidence": "", "source": "proposed"}, "Timing": {"evidence": "KYC-C-07 Frequency: Continuous (§5.2) | Hash chain checkpointed to external timestamping authority weekly (§8 D5)", "source": "document"}, "What it checks": {"evidence": "Every control writes to the Audit Ledger with the case ID, the actor (human or system), the policy clause it satisfies, and the timestamp. (§5.2 footer) | Case Manager → Audit Ledger: every state transition, hash-chained, retained 10 years (matches AMLD record-keeping). (§7.3)", "source": "document"}}
---
## What it checks
Every KYC decision and every case state-transition is recorded with the case ID, the actor (human or system), the policy clause satisfied, and a timestamp in an append-only, hash-chained ledger retained for 10 years.

## Control activity
The Audit Service writes every case state transition to the ledger immediately. The Merkle hash chain is checkpointed to an external timestamping authority weekly, making silent tampering detectable. Records are retained for 10 years to match AMLD record-keeping requirements.

## Risk addressed
Inability to reconstruct why a review was approved — the root cause of the BaFin §44 KWG inspection finding on evidence completeness (Sep 2025) and a core pain point in the As-Is process where audit reconstruction requires pulling four inconsistently

## Timing
Continuous — every state transition is written to the ledger immediately; hash-chain checkpoint to external timestamping authority runs weekly.

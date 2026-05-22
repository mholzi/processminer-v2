---
id: CP-PR-014
type: control
section: controls
title: Immutable audit ledger of decisions
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
controlType: DETECTIVE
execution: AUTOMATED
effectiveness: HIGH
owner: Audit Service
step: [PS-PR-001, PS-PR-003, PS-PR-005, PS-PR-006, PS-PR-007]
regulatedBy: [REG-PR-001, REG-PR-002, REG-PR-005]
provenance: {"Control activity": {"evidence": "", "source": "proposed"}, "Risk addressed": {"evidence": "[As-Is, p.7:] Audit fragility. Reconstructing why a review was approved requires pulling four artefacts, none of which are timestamped consistently. [D5, p.15:] Closes the BaFin §44 finding decisively. [Executive Summary:] BaFin §44 KWG inspection, Sep 2025.", "source": "document"}, "Timing": {"evidence": "[Table:] Frequency: Continuous. [§7.3:] Case Manager → Audit Ledger: every state transition.", "source": "document"}, "What it checks": {"evidence": "", "source": "proposed"}}
---
## What it checks
Whether every material decision — trigger, STP auto-approve, analyst decision, FCO sign-off, and close-out — is recorded with actor identity, timestamp, policy clause, and case ID, and whether the record is tamper-free.

## Control activity
The Audit Ledger receives a write from the Case Manager on every state transition. Records are append-only and Merkle hash-chained, checkpointed to an external timestamping authority weekly. Each entry carries the case ID, actor identity, policy clause, and timestamp. The ledger is retained for 10 years per AMLD record-keeping requirements.

## Risk addressed
Without an immutable ledger, reconstructing why a review was approved requires pulling artefacts from four systems — the root cause of As-Is audit fragility. The BaFin §44 KWG inspection finding on evidence completeness is directly closed by this control.

## Timing
Continuous; a ledger entry is written automatically on every case state transition throughout the review lifecycle.

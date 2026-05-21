---
id: SYS-PR-008
type: system
section: systems
title: Audit Ledger
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
systemType: CORE
integrates: [SYS-PR-001]
provenance: {"Purpose": {"evidence": "§7.2: Role = 'Immutable decision log'; Build/Buy = 'Build (hash-chained)'. §7.3: 'Case Manager → Audit Ledger: every state transition, hash-chained, retained 10 years (matches AMLD record-keeping)'.", "source": "document"}, "Role in this process": {"evidence": "", "source": "proposed"}}
---
## Purpose
Append-only, hash-chained log of all KYC decisions, retained for 10 years per AMLD record-keeping requirements.

## Role in this process
Receives a state-transition write from the KYC Case Manager at every step in the review lifecycle. The Merkle hash chain is checkpointed to an external timestamping authority weekly. Addresses the BaFin §44 evidence-completeness finding.

---
id: INT-DDMM-005
type: integration
section: integrations
title: MMS to Payment Hub — Intraday Mandate Sync
status: draft
confidence: high
source: ddmm-it-architect
systems: [SYS-DDMM-002, SYS-DDMM-003]
provenance: {"What connects": {"evidence": "SME (M. Vogel) confirmed: one-directional intraday batch sync from MMS to Payment Hub mandate store; not real-time (divergence window covered by CP-DDMM-004).", "source": "elicited"}, "What flows": {"evidence": "SME confirmed: new mandate records (UMR, CI, IBAN, type, status: active), mandate amendments (updated fields for existing UMR), mandate cancellations (status update to cancelled).", "source": "elicited"}}
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## What connects
One-directional intraday batch sync from the Mandate Management System to the Payment Hub; registered, amended, and cancelled mandate records are pushed to keep the Payment Hub mandate store in sync.

## What flows
- New mandate records (UMR, CI, debtor IBAN, mandate type, status: active)
- Mandate amendments (updated fields for existing UMR records)
- Mandate cancellations (status update to cancelled for existing UMR records)

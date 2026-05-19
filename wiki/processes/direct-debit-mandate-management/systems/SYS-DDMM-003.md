---
id: SYS-DDMM-003
type: system
section: systems
title: Payment Hub
status: draft
confidence: high
source: ddmm-dtp-mockup.md
systemType: SUPPORTING
steps: [PS-DDMM-005, PS-DDMM-007]
provenance: {"Purpose": {"evidence": "Payment Hub | Holds the mandate store used by SEPA collections; receives R-transactions", "source": "document"}, "Role in this process": {"evidence": "SME (M. Vogel) confirmed: Payment Hub mandate store updated via intraday batch sync from MMS (not real-time); divergence window exists and is covered by CP-DDMM-004.", "source": "elicited"}}
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
integrates: [SYS-DDMM-002]
---
## Purpose
Central payment processing system that holds the mandate store used by the SEPA collections process and receives inbound R-transactions from the payment scheme.

## Role in this process
Updated via intraday batch sync from MMS after Step 5 registrations and changes (not real-time; divergence window covered by CP-DDMM-004). In Step 7, the source of inbound R-transaction messages that trigger the R-transaction handling flow.

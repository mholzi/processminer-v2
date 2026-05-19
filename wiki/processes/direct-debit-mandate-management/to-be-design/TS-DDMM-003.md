---
id: TS-DDMM-003
type: target-state
section: to-be-design
title: Real-Time Status Visibility and Proactive Creditor Communication
status: draft
confidence: high
source: ddmm-transformation-agent
replaces: [PS-DDMM-005, PS-DDMM-007]
systems: [SYS-DDMM-001, SYS-DDMM-002]
risks: [IR-DDMM-002, IR-DDMM-004]
provenance: {"Rationale": {"evidence": "SME confirmed: FP-DDMM-003 is the highest-volume creditor complaint; framing accepted without edit.", "source": "elicited"}, "Target description": {"evidence": "SME (M. Vogel) confirmed: accurate, correctly carries IR-DDMM-002 and IR-DDMM-004 risks and preserves sanctions-hold opacity; accepted without edit. Trim is formatting-only, content unchanged.", "source": "elicited"}, "What changes": {"evidence": "SME confirmed all six change bullets — accepted without edit.", "source": "elicited"}}
---
## Target description
MMS emits stage-level events at key processing milestones — receipt, validation, dual-control, and registration — surfaced in the Creditor Portal as a live status timeline per mandate. Creditors opt into email or webhook push notifications at action-required milestones. R-transaction resolutions and SL01 restrictions are notified proactively, not discovered on login. An in-portal query channel lets creditors raise a question against a specific mandate; Payments Operations responds within the portal, with the exchange logged to the mandate record. Sanctions-hold stages remain undisclosed per EX-DDMM-002.

## What changes
- Stage-level processing events surface in the Creditor Portal as a live mandate timeline, replacing binary pending/complete status
- Opt-in email or webhook push notifications delivered at action-required milestones
- R-transaction notifications proactive by default — no portal login required to discover them
- SL01 restriction applied with immediate portal notification, closing the current zero-notification design omission (FP-DDMM-006)
- In-portal mandate query channel replaces RM relay for status and support queries; full exchange logged to the mandate record
- Sanctions-hold stage preserved as opaque in-review label per tipping-off rules (EX-DDMM-002)

## Rationale
FP-DDMM-003 is the highest-volume creditor complaint; FP-DDMM-004, FP-DDMM-005, and FP-DDMM-006 multiply RM and service desk load without adding value. Real-time events and a direct query channel close the structural information gap between MMS and the creditor in one coherent capability.

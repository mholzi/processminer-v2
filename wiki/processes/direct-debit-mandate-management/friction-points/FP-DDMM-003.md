---
id: FP-DDMM-003
type: friction-point
section: friction-points
title: Opaque Processing Status
status: draft
confidence: high
source: ddmm-client-journey-specialist
severity: HIGH
occursAt: [PS-DDMM-003, PS-DDMM-004, PS-DDMM-005]
provenance: {"Client impact": {"evidence": "SME confirmed: trust erodes quietly; worst during sanctions hold where reason cannot be disclosed (tipping-off rules, EX-DDMM-002); many contact RM unnecessarily.", "source": "elicited"}, "Description": {"evidence": "SME (M. Vogel): portal shows only pending/in-progress with no detail — any creditor wanting an actual reason must go out-of-band.", "source": "elicited"}, "Root cause": {"evidence": "SME confirmed: portal status display designed to show simple operational state; no SLA-progress or stage-tracking data exposed to creditor-facing layer.", "source": "elicited"}}
---
## Description
After submission, the Creditor Portal shows only a binary pending / in-progress status label with no reason, estimated completion time, or indication of which processing stage the mandate has reached.

## Root cause
The portal's status display was designed to show a simple operational state, not a processing stage or timeline. No SLA-progress or stage-tracking data is exposed to the creditor-facing layer.

## Client impact
Creditors with time-sensitive collection campaigns cannot plan around an unknown completion time. Many contact their RM unnecessarily, adding indirect load to the service desk. The opacity is most damaging during a sanctions hold, where the reason cannot be disclosed and the creditor cannot be reassured.

---
id: II-DDMM-002
type: innovation-idea
section: innovation-ideas
title: Real-Time Mandate Status Events and Push Notifications
status: draft
confidence: high
source: ddmm-innovation-analyst
category: Customer Experience
strategicFit: HIGH
complexity: MEDIUM
addresses: [FP-DDMM-003, FP-DDMM-004, FP-DDMM-006]
fromTrend: [TR-DDMM-002]
provenance: {"Expected benefit": {"evidence": "SME confirmed: highest-volume client complaint eliminated; RM/service desk load reduced; R-transaction resolutions pushed proactively.", "source": "elicited"}, "Feasibility": {"evidence": "SME confirmed: INT-DDMM-007 push path already exists; sanctions-hold stages must remain undisclosed (tipping-off rules, EX-DDMM-002) — opaque in-review label preserved.", "source": "elicited"}, "The idea": {"evidence": "SME (M. Vogel): FP-DDMM-003 (opaque status) is the daily creditor complaint; FP-DDMM-004 (passive notification) and FP-DDMM-006 (SL01 zero notification) are design omissions, not compliance bars — extending the real-time notification model covers all three.", "source": "elicited"}}
---
## The idea
Replace the binary pending / in-progress portal status with stage-level events emitted by MMS surfaced in the Creditor Portal. Add opt-in email or webhook notification at key milestones so creditors discover resolutions without portal login. Extend to include SL01 collection restrictions — a design omission, not a compliance constraint.

## Expected benefit
Directly eliminates the highest-volume client complaint (FP-DDMM-003) and converts passive R-transaction and SL01 notifications into proactive pushes. Reduces RM and service desk load from status-chasing calls across every submission.

## Feasibility
The MMS-to-portal push path already exists; extending it to emit stage events is an incremental change. Dependency: MMS event model must be enriched to expose in-progress stages. Sanctions-hold stages must remain undisclosed — the opaque in-review label is preserved for those cases.

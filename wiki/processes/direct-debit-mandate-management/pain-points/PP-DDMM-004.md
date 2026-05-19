---
id: PP-DDMM-004
type: pain-point
section: pain-points
title: Undifferentiated Work Queue — No SLA Prioritisation
status: draft
confidence: high
source: M. Vogel, Senior Payments Operations Analyst
category: Workflow
severity: HIGH
priority: P1
affects: [PS-DDMM-002, PS-DDMM-007]
provenance: {"Description": {"evidence": "New mandate captures, amendments, cancellations and inbound R-transactions all land in one shared work queue with no prioritisation by SLA urgency or request type. Clerk has to manually scan the whole queue to decide what to work next.", "source": "elicited"}, "Impact": {"evidence": "Nothing flags an item approaching its SLA breach point. An urgent single-mandate registration near its 1-day SLA (M-DDMM-001) can sit behind a large bulk file or run of R-transactions. Risk is silent SLA breaches — not because the team is slow, but because the queue gives them no signal about urgency.", "source": "elicited"}, "Root cause": {"evidence": "Queue gives no signal about urgency. SME confirmed 'time-to-breach' and 'Clerk judgement on each shift' as fair framing.", "source": "elicited"}}
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## Description
New registrations, amendments, cancellations and inbound R-transactions share a single work queue with no prioritisation by SLA urgency or request type. The Mandate Clerk must manually scan the full queue to determine what to work next.

## Impact
Items approaching their SLA breach point carry no flag, so an urgent single-mandate registration near its 1-day deadline (M-DDMM-001) can silently queue behind bulk files or R-transactions. The result is SLA breaches driven by poor queue visibility, not by team speed.

## Root cause
The work queue does not expose SLA deadlines or time-to-breach alongside each item. Without system-generated prioritisation signals, sequencing is left to the Clerk's judgement on each shift.

---
id: PP-BGI-001
type: pain-point
section: pain-points
title: Credit Limit Shortfall
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
category: delay
severity: HIGH
affects: [PS-BGI-002]
provenance: {"Description": {"evidence": "Applications frequently stall at the credit and facility check when the client has not pre-arranged enough limit.", "source": "document"}, "Impact": {"evidence": "2-5 business days for routine Credit resolution, longer for Credit Committee cases. Even routine resolution breaches the 3-business-day SLA.", "source": "elicited"}, "Root cause": {"evidence": "Clients don't track facility headroom day-to-day, and the bank does not proactively monitor or flag low headroom to the client or RM. Both contribute. Handled purely reactively today — no proactive flagging.", "source": "elicited"}}
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-19
---
## Description
Applications frequently stall at the credit and facility check when the client has not pre-arranged sufficient guarantee facility limit.

## Impact
This is the most common reason for delay: the application is parked while Credit resolves the shortfall, typically 2–5 business days for routine cases, longer for Credit Committee approvals. Even routine resolution breaches the 3-business-day turnaround SLA.

## Root cause
Two underlying causes: clients do not track guarantee facility headroom day-to-day and are unaware of shortfalls until application; and the bank does not proactively monitor or flag low headroom to the client or relationship manager. Handling today is purely reactive.

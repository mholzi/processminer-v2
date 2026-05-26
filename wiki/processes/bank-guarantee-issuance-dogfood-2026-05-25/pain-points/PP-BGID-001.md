---
id: PP-BGID-001
type: pain-point
section: pain-points
title: Facility Limit Shortfall Causing Application Stalls
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
severity: HIGH
category: credit/facility
priority:
affects: [PS-BGID-002]
provenance: {"Description": {"evidence": "Applications frequently stall at the credit and facility check when the client has not pre-arranged enough limit. […] this is the most common reason for delay.", "source": "document"}, "Impact": {"evidence": "", "source": "proposed"}, "Root cause": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:56:10Z
---
## Description
Applications frequently stall at the credit and facility check when the client has not pre-arranged enough limit. This is the most common reason for delay in the bank guarantee issuance process.

## Impact
Stalled applications extend cycle time beyond the 3-business-day SLA target, and the application is parked while it is routed to the Credit team.

## Root cause
Clients submit guarantee applications without first confirming their available facility limit, and there is no proactive limit-check prompt or pre-submission advisory step in the Corporate Portal intake flow.

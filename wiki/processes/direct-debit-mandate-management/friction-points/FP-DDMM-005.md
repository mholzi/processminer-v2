---
id: FP-DDMM-005
type: friction-point
section: friction-points
title: No Direct Support Line
status: draft
confidence: high
source: ddmm-client-journey-specialist
severity: MEDIUM
occursAt: [PS-DDMM-002, PS-DDMM-003, PS-DDMM-004, PS-DDMM-005]
---
## Description
A creditor needing to query a delayed or rejected mandate has no direct access to the Payments Operations team. All queries must be routed through a Relationship Manager or a Payments service desk email, which then relay to operations internally.

## Root cause
There is no direct creditor-to-operations contact path in the channel model; corporate banking relationships are managed through Relationship Managers, and service queries are handled through the Payments service desk rather than the processing team directly.

## Client impact
Every query involves at least two hand-offs — creditor to RM or service desk, then to operations — multiplying response latency. The creditor cannot escalate directly if the relay stalls, and the portal provides no status update to fill the gap.

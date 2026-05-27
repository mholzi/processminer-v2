---
id: IR-BGID-006
type: innovation-risk
section: innovation-risks
title: Facility Headroom Dashboard — Credit System Data Freshness
status: draft
confidence: medium
source: innovation-analyst session 2026-05-26
severity: MEDIUM
updatedBy: admin
updatedAt: 2026-05-26T09:56:41Z
approval: in-progress
approvalBy: admin
approvalDate: 2026-05-26
---
## The risk
The facility headroom feed from the core credit system is delayed or stale, causing corporate clients to see available headroom that has since been committed by another transaction, leading to applications that stall at the credit check despite the client pre-qualifying on the dashboard.

## Likelihood & impact
Moderate likelihood if the credit system does not expose a real-time event stream; MEDIUM impact — undermines client trust in the dashboard and recreates the PP-BGID-001 stall the idea was designed to prevent.

## Mitigation
Maximum 15-minute cache TTL with a prominent staleness indicator in the portal UI; advisory wording clarifying that headroom is indicative, not a committed reservation; SLA on the credit-system API feed documented in DEP-BGID-001.

---
id: II-BGID-001
type: innovation-idea
section: innovation-ideas
title: Proactive Facility Headroom Alerts via Corporate Portal
status: draft
confidence: medium
category: automation
strategicFit: HIGH
complexity: MEDIUM
addresses: [PP-BGID-001]
fromTrend: [TR-BGID-003, TR-BGID-006]
fromCompetitor: [CEU-BGID-003]
updatedBy: the assistant
updatedAt: 2026-05-28T15:30:28Z
---
## The idea
Surface real-time guarantee facility utilisation and available headroom in the Corporate Portal, with threshold alerts sent to clients and relationship managers when headroom falls below a configurable level — before the next application is submitted.

## Expected benefit
Eliminates the majority of the 15–20% of applications that stall at Credit and Facility Check (PP-BGID-001), improving SLA attainment and reducing Credit team workload. Clients manage their own facility capacity proactively.

## Feasibility
Finastra Trade Innovation Nexus exposes facility data via REST API, and the Corporate Portal already integrates with TFS. Alert delivery via portal notification and email is low-complexity. Main dependency: Nexus migration or API enablement on the current on-prem instance.

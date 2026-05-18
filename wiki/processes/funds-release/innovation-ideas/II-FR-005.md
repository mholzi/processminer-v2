---
id: II-FR-005
type: innovation-idea
section: innovation-ideas
title: Currency-aware reference-data engine
status: draft
confidence: medium
source: source-innovation web research
category: Reference data
strategicFit: MEDIUM
complexity: MEDIUM
addresses: [PG-FR-004, PG-FR-011, PG-FR-001]
fromTrend: [TR-FR-001]
---
## The idea
Build a shared reference-data service holding per-currency business calendars, same-day-value cut-off times and the FX rate source and timestamp, and have PS-FR-002, PS-FR-005 and PS-FR-007 read value-date and threshold rules from it.

## Expected benefit
Value dates roll on a consistent, currency-aware rule, non-EUR releases are dated against the right cut-off, and the EUR 5m threshold test becomes reproducible — removing three sources of ad-hoc, per-analyst inconsistency.

## Feasibility
Moderate build of a reference-data store and its feeds; the harder dependency is the policy decisions it encodes — the rolling rule, the cut-off table and the FX convention — which need SME sign-off first.

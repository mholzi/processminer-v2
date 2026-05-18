---
id: II-COB-009
type: innovation-idea
section: innovation-ideas
title: Real-time SLA and per-step timing dashboard
status: draft
confidence: medium
source: Derived from market trend TR-COB-005 and competitor move CGL-COB-001 (web-sourced)
category: Process
strategicFit: HIGH
complexity: MEDIUM
addresses: [PG-COB-001, PG-COB-003]
fromTrend: [TR-COB-005]
fromCompetitor: [CGL-COB-001]
provenance: {"Expected benefit": {"evidence": "https://www.celonis.com/blog/5-banking-guide-takeaways - process mining pinpoints \"exactly where time is leaking through long waits, unnecessary handoffs, and reassignments\" - fetched 2026-05-18", "source": "web"}, "Feasibility": {"evidence": "https://www.qpr.com/blog/process-mining-financial-services-benefits - process mining built on captured event data / timestamps - fetched 2026-05-18", "source": "web"}, "The idea": {"evidence": "https://www.servicenow.com/community/process-mining-blog/process-mining-in-minutes-minute-5-sla-breach-analysis/ba-p/3532395 - \"SLA dashboards show what was missed, while process mining reveals why\" - fetched 2026-05-18", "source": "web"}}
---
## The idea
Instrument the onboarding workflow to capture step start and end times, and report SLA adherence and per-step duration on a live dashboard, so the slowest step and a slipping week are both visible at a glance.

## Expected benefit
Replaces intuition-led improvement with evidence: managers see the real bottleneck step, catch SLA slippage before clients complain, and can give clients a status they can trust.

## Feasibility
Medium complexity - needs event timestamps captured in OWS and a process-mining or dashboard layer over them. Addresses process gaps PG-COB-001 and PG-COB-003.

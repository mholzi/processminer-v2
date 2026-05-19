---
id: PP-DDMM-002
type: pain-point
section: pain-points
title: Dual-Control Checker Availability Bottleneck
status: draft
confidence: high
source: M. Vogel, Senior Payments Operations Analyst
category: Capacity
severity: MEDIUM
priority: P2
affects: [PS-DDMM-004]
provenance: {"Description": {"evidence": "With 10–15 bulk files a week, each needs an independent Mandate Checker who is not the submitter. Pool of staff senior enough to act as Checker is small, so on busy days or when one or two are on leave, bulk files sit in a queue waiting for an available Checker rather than for any actual review effort.", "source": "elicited"}, "Impact": {"evidence": "That waiting time eats directly into the 2-day bulk SLA (M-DDMM-002) even though the review itself is quick. Scheduling/capacity friction, not a review-quality problem.", "source": "elicited"}, "Root cause": {"evidence": "Pool restricted to senior staff who did not submit the batch. Small team, 10-15 bulk files/week. SME confirmed 'segregation of duties' as correct framing for the constraint.", "source": "elicited"}}
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## Description
Bulk mandate files requiring dual-control sit in a queue waiting for an available Mandate Checker rather than for actual review effort. On busy days or when senior staff are on leave, the small pool of eligible Checkers becomes the bottleneck.

## Impact
Checker wait time eats directly into the 2-day bulk processing SLA (M-DDMM-002) even though the review itself is quick. Files are delayed not by review complexity but by Checker availability — a scheduling friction, not a quality problem.

## Root cause
The eligible Checker pool is restricted to senior Payments Operations staff who did not submit the batch (segregation of duties). With a small team and 10–15 bulk files per week, capacity is tight and any leave compounds into queue buildups.

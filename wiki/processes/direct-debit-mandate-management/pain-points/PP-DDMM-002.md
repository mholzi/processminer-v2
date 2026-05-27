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

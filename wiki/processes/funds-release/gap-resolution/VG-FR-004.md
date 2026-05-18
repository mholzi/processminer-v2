---
id: VG-FR-004
type: gap
section: gap-resolution
title: No measured baseline and unlogged deviations
status: draft
confidence: medium
source: SME interview - M. Berger
validationArea: Performance & exceptions
gapStatus: addressed-in-target
---
## The gap
The process has no measured metric baseline (PG-FR-009) and no intra-day manual-release target (PG-FR-010), and two deviations leave no record — the suspended-facility bounce (PG-FR-006) and posting failures (EX-FR-005) — so they are invisible to metrics and audit.

## Resolution
TS-FR-004 instruments the workflow to measure actual STP, manual and exception turnaround in real time against target, and adds an agentic triage layer that classifies and auto-logs every off-happy-path item — including the suspended-facility bounce and posting failures — as a tracked exception.

## Status
Designed in the target state (TS-FR-004); not yet built. The workflow already timestamps each step, so instrumentation is extraction and reporting; an intra-day manual target must still be agreed.

---
id: TD-COB-006
type: transformation-decision
section: transformation-decisions
title: Instrument the workflow for SLA and per-step timing
status: draft
confidence: low
source: Consolidated by source-target from the COB-003 wiki
decisionType: PROCESS
decisionStatus: PROPOSED
resolves: [PG-COB-001, PG-COB-003]
realises: [TS-COB-002]
fromIdea: [II-COB-009]
provenance: {"Options considered": {"evidence": "", "source": "proposed"}, "Rationale": {"evidence": "", "source": "proposed"}, "The decision": {"evidence": "", "source": "proposed"}}
---
## The decision
Instrument the onboarding workflow to capture step start and end times as events, and report SLA adherence and per-step duration on a live dashboard.

## Options considered
- Capture event timestamps in the workflow system and build a process-mining dashboard over them
- Add a simpler SLA report without per-step timing detail
- Measure timing manually through periodic case reviews
- Continue without per-step measurement

## Rationale
Every step has an SLA but adherence is measured nowhere, and only total cycle time is known. Without per-step timing, improvement is aimed by intuition. Event-level instrumentation makes the real bottleneck and a slipping week visible before a client complains, and is a prerequisite for continuous monitoring.

---
id: VG-COB-004
type: gap
section: gap-resolution
title: Workflow system does not capture step-level event timing
status: draft
confidence: low
source: Consolidated by source-target from the COB-003 wiki
validationArea: Process Instrumentation
gapStatus: open
provenance: {"Resolution": {"evidence": "", "source": "proposed"}, "Status": {"evidence": "", "source": "proposed"}, "The gap": {"evidence": "", "source": "proposed"}}
---
## The gap
The workflow system does not capture step start and end timestamps, so SLA adherence and per-step duration cannot be reported. Both the SLA dashboard and continuous controls monitoring depend on this event data.

## Resolution
The transformation must instrument the workflow system to emit step-level event timestamps, then layer dashboard and process-mining capability over them. This event-data foundation serves target state TS-COB-002 and is also a prerequisite for the continuous monitoring in TS-COB-005.

## Status
Open — no event-timing capture exists today; instrumentation is the first step of TD-COB-006.

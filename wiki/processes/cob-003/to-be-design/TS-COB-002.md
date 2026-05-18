---
id: TS-COB-002
type: target-state
section: to-be-design
title: Unified, instrumented onboarding case workspace
status: draft
confidence: low
source: Consolidated by source-target from the COB-003 wiki
replaces: [PS-COB-001, PS-COB-002, PS-COB-003, PS-COB-004, PS-COB-005, PS-COB-006]
systems: [SYS-COB-001, SYS-COB-002]
provenance: {"Rationale": {"evidence": "", "source": "proposed"}, "Target description": {"evidence": "", "source": "proposed"}, "What changes": {"evidence": "", "source": "proposed"}}
---
## Target description
Onboarding runs on a single orchestrated case workspace that stitches CRM, workflow, KYC, screening, core banking and card management into one view. Staff see the full state of a case on one screen, data is entered once and propagated automatically, and step start and end times are captured as events. SLA adherence and per-step duration are reported on a live dashboard, and the client can see real-time onboarding status.

## What changes
- Six-plus disconnected systems are unified behind one orchestrated case view
- Data is entered once and propagated, ending the re-keying between systems
- Step start and end times are captured as events rather than going unmeasured
- SLA adherence and per-step duration appear on a live dashboard, not a periodic look-back
- The client gets real-time onboarding status instead of silence

## Rationale
System fragmentation drives re-keying errors and slow handovers, and the process today cannot tell a healthy week from a slipping one. A unified, instrumented workspace removes both blind spots and is what competitor banking platforms now treat as table stakes.

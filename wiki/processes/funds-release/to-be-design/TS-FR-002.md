---
id: TS-FR-002
type: target-state
section: to-be-design
title: Governed straight-through release rail
status: draft
confidence: medium
source: SME interview - M. Berger
replaces: [PS-FR-002, PS-FR-003, PS-FR-004, PS-FR-006]
systems: [SYS-FR-001, SYS-FR-003]
risks: [IR-FR-001]
---
## Target description
The straight-through path is an explicit, documented branch of the process spine, not an undocumented carve-out. Every STP item passes a real-time rules-based control layer that validates and screens it and applies a recorded, governed automated approval. Executed STP releases are monitored by post-release sampling, and an anomaly-hold pulls any suspect release back for human review. The conditions under which an item drops out of STP into manual handling are defined, and the control layer's coverage is auditable end to end.

## What changes
- The STP path is documented as an explicit spine branch with its automated validation, screening and approval
- A real-time rules-based control layer covers every STP item, replacing the unmonitored system-applied approval
- Post-release monitored sampling and an anomaly-hold give STP releases a continuously-monitored compensating control
- The drop-out conditions from STP into manual handling are defined and auditable
- The audit log for an STP release shows a governed, named control rather than only a system actor

## Rationale
STP is the fastest-growing share of volume and today the least controlled — system-applied approval with no human dual-control and no compensating control (CG-FR-001). A documented, continuously-monitored control layer turns the highest-severity gap into a governed rail and meets the supervisory expectation that automated rails carry automated controls.

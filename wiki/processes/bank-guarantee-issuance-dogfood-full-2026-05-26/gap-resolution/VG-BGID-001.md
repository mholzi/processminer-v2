---
id: VG-BGID-001
type: gap
section: gap-resolution
title: Application Completeness Control at Intake
status: draft
confidence: high
source: SME interview — transformation-agent session 2026-05-26
validationArea: Control gaps
gapStatus: addressed-in-target
updatedBy: admin
updatedAt: 2026-05-26T09:27:02Z
---
## The gap
The Corporate Portal lacks system-level enforcement of mandatory fields at submission (CG-BGID-001); the completeness check is manual, performed by the TFO, with no system gate preventing incomplete applications from advancing into the process.

## Resolution
TD-BGID-003 (Smart Intake Portal) closes this gap by implementing system-level mandatory field enforcement before submission, blocking incomplete applications at the portal. TD-BGID-001 (ICC-SWIFT API Channel) applies equivalent mandatory field validation at the API layer, ensuring the enforcement covers both intake paths. The TFO's manual completeness check is no longer needed as a compensating control.

## Status
Addressed in the target state by TS-BGID-001 via TD-BGID-003 and TD-BGID-001. No residual control gap remains once both enforcement mechanisms are live.

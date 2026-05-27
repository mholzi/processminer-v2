---
id: TS-DDMM-007
type: target-state
section: to-be-design
title: Compliant Mandate Lifecycle Governance
status: draft
confidence: high
source: ddmm-transformation-agent
replaces: [PS-DDMM-006]
systems: [SYS-DDMM-002]
risks: []
---
## Target description
A formal data retention period is defined for mandate records — active lifetime plus a statutory minimum post-cancellation — satisfying GDPR Art. 5(1)(e). The same threshold becomes the dormancy trigger in CP-DDMM-005, making that control auditable; CG-DDMM-001 and PG-DDMM-003 are closed in a single governance act. Mandates are purged or anonymised on an automated MMS schedule at end of retention. CI deactivation triggers a proactive review of all active mandates under that CI — each assessed for suspension, cancellation, or retention — recorded per mandate, closing PG-DDMM-002.

## What changes
- Formal retention period defined and documented for mandate records (CG-DDMM-001 closed)
- Dormancy trigger in CP-DDMM-005 aligned to the same retention threshold (PG-DDMM-003 closed)
- Automated purge or anonymisation schedule implemented in MMS at end of retention period
- CI deactivation triggers automated mandate review across all active mandates under that CI (PG-DDMM-002 closed)
- CI deactivation outcome — suspend, cancel, or retain — recorded per mandate with documented rationale
- Retention period and dormancy threshold require Legal/DPO approval before adoption

## Rationale
CG-DDMM-001 and PG-DDMM-003 are the same governance gap expressed in two different registers — retention and dormancy both lack a defined threshold. One decision closes both. PG-DDMM-002 is the only open lifecycle gap with no current procedure; reactive handling is both a compliance risk and an operational one.

---
id: PS-NH-058
type: process-step
section: process-steps
title: Close onboarding ticket and archive evidence
status: draft
source: new-hr-onboarding-dtp.md
owner: HR Operations
sla: Day 95
condition: Probation decision documented in Workday at ps-28
systems: [SYS-NH-003, SYS-NH-001]
transitions: []
provenance: {"Inputs": {"evidence": "", "source": "proposed"}, "Outputs": {"evidence": "5.3 — 'Close onboarding ticket; archive evidence'; CTL-NHO-06 — 'Probation decision documented within 95 days of start'", "source": "document"}, "What happens": {"evidence": "5.3 — 'Close onboarding ticket; archive evidence | HR Ops | Day 95'", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
updatedBy: admin
updatedAt: 2026-05-25T13:52:52Z
---
## What happens
HR Operations closes the main onboarding ticket in ServiceNow and archives all onboarding evidence in the employee's Workday record. The process is formally marked complete.

## Inputs
- Probation decision record from Workday (ps-28)
- ServiceNow onboarding ticket with all sub-tasks
- Onboarding documents collected throughout the process

## Outputs
- ServiceNow onboarding ticket closed
- Evidence archived in Workday employee file
- Onboarding ticket cycle time data available for §9 metric reporting
- Audit-ready file satisfying CTL-NHO-06

## Why it matters
Closing and archiving within Day 95 ensures the organisation holds a complete, retrievable audit trail for every hire — supporting internal audit and any future employment disputes. It also enables accurate cycle-time measurement against the §9 target of ≤ 12 working days end-to-end.

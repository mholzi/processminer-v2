---
id: PS-NH-052
type: process-step
section: process-steps
title: Validate access — all role-required systems reachable
status: draft
source: new-hr-onboarding-dtp.md
owner: New Hire
sla: Day 5
condition: Mandatory training Tier 1 complete and all provisioning sub-tickets closed (ps-19, ps-8)
systems: [SYS-NH-005, SYS-NH-003]
transitions: [PS-NH-053|normal|all role-required systems validated by Day 5, EX-NH-015|exception|one or more systems not reachable — exception raised in ServiceNow]
provenance: {"Inputs": {"evidence": "", "source": "proposed"}, "Outputs": {"evidence": "", "source": "proposed"}, "What happens": {"evidence": "3.5 Validate access — all role-required systems reachable; raise exceptions | New Hire / IT | Day 5", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
updatedBy: admin
updatedAt: 2026-05-25T13:52:52Z
---
## What happens
The new hire confirms they can reach every system required for their role. Any system that is not reachable is raised as an exception in ServiceNow for IT Service Desk resolution.

## Inputs
- Role access template specifying required systems (from ps-8 provisioning)
- Confirmed first login and MFA enrolment (ps-15)
- Mandatory training Tier 1 completion record (ps-19)

## Outputs
- All role-required systems confirmed reachable, or exceptions raised in ServiceNow
- IT Service Desk tickets opened for any access failures

## Why it matters
Day 5 access validation confirms the new hire can perform their role and that provisioning completed correctly, surfacing any defects while the onboarding team is still engaged.

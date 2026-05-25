---
id: PS-NH-020
type: process-step
section: process-steps
title: Benefits enrolment window
status: draft
source: new-hr-onboarding-dtp.md
owner: HR Operations
sla: Day 5
condition: Employee record active in Workday (ps-7)
systems: [SYS-NH-001]
transitions: [PS-NH-021|normal|benefits enrolment window opened by Day 5]
provenance: {"Inputs": {"evidence": "", "source": "proposed"}, "Outputs": {"evidence": "", "source": "proposed"}, "What happens": {"evidence": "3.2 Benefits enrolment window opens | HR Ops / New Hire | Day 5", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
updatedBy: admin
updatedAt: 2026-05-25T13:52:35Z
---
## What happens
HR Operations opens the benefits enrolment window for the new hire in Workday by Day 5. The new hire selects their benefits elections within the enrolment period. The HR Business Partner handles exceptions (§3 roles).

## Inputs
- Active employee record in Workday with compensation and grade data (ps-7)
- Benefits package options applicable to the new hire's grade and location

## Outputs
- Benefits elections recorded in Workday
- Enrolment window status updated in Workday

## Why it matters
Timely benefits enrolment ensures deductions are captured before the first payroll cut-off and that the new hire has active cover from their start date.

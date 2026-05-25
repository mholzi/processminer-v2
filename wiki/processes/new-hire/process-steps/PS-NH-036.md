---
id: PS-NH-036
type: process-step
section: process-steps
title: Create employee record in Workday
status: draft
source: new-hr-onboarding-dtp.md
owner: HR Operations
sla: T-5
condition: Signed contract collected; tax and bank details received
systems: [SYS-NH-001]
transitions: [PS-NH-037|normal|always]
provenance: {"Inputs": {"evidence": "1.4 Collect signed contract, ID, tax and bank details; 1.7 Create employee record in Workday; assign employee ID", "source": "document"}, "Outputs": {"evidence": "", "source": "proposed"}, "What happens": {"evidence": "1.7 Create employee record in Workday; assign employee ID | HR Ops | T-5; §5 Workday (HRIS): Employee master record, org structure, comp", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-25T13:56:58Z
---
## What happens
HR Operations creates the employee record in Workday and assigns an employee ID, as stated in step 1.7. Workday is the system of record for the employee master record, org structure, and compensation (§5). The claim that the record is created in a 'pre-active state' is not stated in the source and has been removed.

## Inputs
- Signed contract (personal details, start date, compensation)
- Collected tax forms and bank details
- Role profile and reporting-line data

## Outputs
- Workday employee record created with employee ID assigned
- Employee identity available in Workday to support downstream IT provisioning at T-3

## Why it matters
The Workday employee record is the master identity that downstream steps depend on. Creating it at T-5 provides lead time before the T-3 IT provisioning step.

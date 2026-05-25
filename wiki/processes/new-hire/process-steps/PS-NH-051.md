---
id: PS-NH-051
type: process-step
section: process-steps
title: Confirm payroll record and first pay cycle
status: draft
source: new-hr-onboarding-dtp.md
owner: Payroll
sla: Day 5
condition: Employee record created in Workday and benefits elections received (ps-7, ps-20)
systems: [SYS-NH-001]
transitions: [PS-NH-052|normal|payroll record confirmed active]
provenance: {"Inputs": {"evidence": "", "source": "proposed"}, "Outputs": {"evidence": "", "source": "proposed"}, "What happens": {"evidence": "3.4 Confirm payroll record active; verify first pay cycle alignment | Payroll | Day 5", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
updatedBy: admin
updatedAt: 2026-05-25T13:52:52Z
---
## What happens
Payroll verifies that the employee record in Workday is active, compensation fields are correctly populated, tax forms and bank account details are on file (collected via DocuSign at step 1.4), and benefits deductions are configured. Payroll confirms the new hire is included in the next scheduled pay cycle.

## Inputs
- Active Workday employee record with compensation, grade and bank details (ps-7)
- Signed tax forms collected via DocuSign (ps-4)
- Benefits elections and deduction instructions from Workday (ps-20)

## Outputs
- Payroll record confirmed active in Workday
- First pay cycle inclusion confirmed

## Why it matters
Failing to capture payroll data by the cut-off date means the new hire will miss their first pay cheque, requiring a manual out-of-cycle payment.

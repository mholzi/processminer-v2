---
id: PS-NH-012
type: process-step
section: process-steps
title: Final go/no-go check before Day 1
status: draft
source: new-hr-onboarding-dtp.md
owner: HR Operations
sla: T-1
condition: All preceding pre-boarding steps complete or in known state
systems: [SYS-NH-001, SYS-NH-003, SYS-NH-004]
transitions: [PS-NH-013|normal|all checks pass, EX-NH-007|exception|background check adverse, EX-NH-009|exception|equipment not delivered, EX-NH-010|exception|right-to-work incomplete]
provenance: {"Inputs": {"evidence": "1.12 Final go/no-go check: background clear, contract signed, kit shipped", "source": "document"}, "Outputs": {"evidence": "", "source": "proposed"}, "What happens": {"evidence": "1.12 Final go/no-go check: background clear, contract signed, kit shipped | HR Ops | T-1", "source": "document"}, "Why it matters": {"evidence": "CTL-NHO-01: No system access provisioned before background screening returns 'clear'; CTL-NHO-03: Right-to-work / I-9 verified on or before Day 1", "source": "document"}}
updatedBy: the assistant
updatedAt: 2026-05-25T13:56:20Z
---
## What happens
HR Operations performs a go/no-go check on the working day before the hire's start date. The three gates stated in step 1.12 are: (1) background screening clear, (2) contract signed, (3) kit shipped. The additional inputs listed in the draft (ServiceNow sub-ticket statuses, Workday record status) go beyond what the source states for this step and have been removed from Inputs.

## Inputs
- Background screening result from HireRight
- DocuSign contract signing status
- Device shipping status

## Outputs
- Go/no-go decision made; any open exceptions escalated with actions assigned
- Confirmed readiness status recorded, allowing Day-1 arrival to proceed or be deferred

## Why it matters
The T-1 go/no-go gate is the last structured opportunity to catch pre-boarding failures before Day 1, and confirms compliance controls CTL-NHO-01 and CTL-NHO-03 are met.

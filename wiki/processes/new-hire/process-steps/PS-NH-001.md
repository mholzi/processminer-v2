---
id: PS-NH-001
type: process-step
section: process-steps
title: Trigger onboarding workflow in Workday
status: draft
source: new-hr-onboarding-dtp.md
owner: HR Operations
sla: T-10
condition: Signed offer letter on file; approved requisition closed in ATS (Greenhouse); start date confirmed in writing; role profile and reporting line documented
systems: [SYS-NH-001, SYS-NH-002]
transitions: [PS-NH-002|normal|always]
provenance: {"Inputs": {"evidence": "§4 Prerequisites: Signed offer letter on file; Approved requisition (REQ-####) closed in the ATS; Start date confirmed in writing; Role profile and reporting line documented; Hiring manager has raised onboarding ticket (HR-####)", "source": "document"}, "Outputs": {"evidence": "", "source": "proposed"}, "What happens": {"evidence": "1.1 Trigger onboarding workflow in Workday from accepted offer | HR Ops | T-10", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-25T13:56:09Z
---
## What happens
HR Operations triggers the onboarding workflow in Workday from the accepted offer. The document does not specify the sub-steps of how the trigger is performed, only that the source is the accepted offer and the SLA is T-10.

## Inputs
- Signed offer letter on file
- Closed requisition in ATS
- Confirmed start date
- Role profile and reporting line
- Onboarding ticket raised by Hiring Manager

## Outputs
- Onboarding workflow triggered in Workday
- Pre-boarding SLA clock started at T-10, enabling downstream steps to be scheduled

## Why it matters
Triggering the Workday workflow at T-10 starts the downstream pre-boarding sequence; without it, subsequent steps have no formal trigger.

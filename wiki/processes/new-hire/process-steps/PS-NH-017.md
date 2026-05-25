---
id: PS-NH-017
type: process-step
section: process-steps
title: Assign mandatory training in LMS
status: draft
source: new-hr-onboarding-dtp.md
owner: Learning & Development
condition: Employee record active in Workday and new hire has logged into LMS
systems: [SYS-NH-007]
transitions: [PS-NH-018|normal|mandatory training curriculum assigned in LMS]
provenance: {"Inputs": {"evidence": "", "source": "proposed"}, "Outputs": {"evidence": "", "source": "proposed"}, "What happens": {"evidence": "2.5 Assign mandatory training in LMS (Code of Conduct, InfoSec, AML, Data Privacy) | L&D", "source": "document"}, "Why it matters": {"evidence": "CTL-NHO-02: Mandatory training Tier 1 completion enforced before access to production systems | Per hire", "source": "document"}}
updatedBy: admin
updatedAt: 2026-05-25T13:52:35Z
---
## What happens
Learning & Development assigns the mandatory Tier 1 training curriculum to the new hire in Cornerstone (LMS). The curriculum includes Code of Conduct, Information Security, AML awareness and Data Privacy modules. Completion is required by Day 5.

## Inputs
- Active employee record in Workday providing role and business-unit attributes
- L&D sub-ticket in ServiceNow specifying curriculum template (ps-6)
- Confirmed new hire email address for LMS account creation

## Outputs
- Mandatory training Tier 1 curriculum assigned in Cornerstone (LMS)
- Completion deadline set to Day 5
- L&D sub-ticket in ServiceNow updated to 'assigned'

## Why it matters
Mandatory training must be assigned on Day 1 so the new hire can complete it within the Day-5 deadline required by Control CTL-NHO-02, which enforces Tier 1 completion before access to production systems.

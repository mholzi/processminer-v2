---
id: PS-NH-010
type: process-step
section: process-steps
title: Confirm desk, building pass and parking
status: draft
source: new-hr-onboarding-dtp.md
owner: Facilities
sla: T-2
condition: Facilities sub-ticket raised in ServiceNow (ps-6)
systems: [SYS-NH-003]
transitions: [PS-NH-011|normal|always]
provenance: {"Inputs": {"evidence": "", "source": "proposed"}, "Outputs": {"evidence": "§3 Facilities: Allocate desk/locker, issue building pass, parking if applicable", "source": "document"}, "What happens": {"evidence": "1.10 Confirm desk, building pass and parking | Facilities | T-2; §3 Facilities: Allocate desk/locker, issue building pass, parking if applicable", "source": "document"}, "Why it matters": {"evidence": "§9 Day-1 readiness (laptop, access, desk all in place) | ≥ 95%", "source": "document"}}
updatedBy: admin
updatedAt: 2026-05-25T13:52:35Z
---
## What happens
Facilities allocates a desk and locker to the new hire, issues a building pass, and arranges parking if applicable. These three items match step 1.10 exactly and the Facilities role in §3. The specific detail that 'the pass is either posted to the hire's home address or held at reception' is not stated in the source and has been removed.

## Inputs
- ServiceNow Facilities sub-ticket
- New hire office location

## Outputs
- Desk and locker allocated
- Building access pass issued
- Parking arranged if applicable

## Why it matters
Confirming physical access at T-2 ensures all three Day-1 readiness components (laptop, access, desk) are in place before the T-1 go/no-go check, supporting the ≥ 95% Day-1 readiness target (§9).

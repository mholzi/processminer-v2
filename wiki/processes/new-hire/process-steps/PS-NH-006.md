---
id: PS-NH-006
type: process-step
section: process-steps
title: Raise IT, Facilities and L&D sub-tickets in ServiceNow
status: draft
source: new-hr-onboarding-dtp.md
owner: HR Operations
sla: T-7
condition: Equipment list confirmed (ps-5); onboarding workflow active in Workday
systems: [SYS-NH-003]
transitions: [PS-NH-007|normal|always]
provenance: {"Inputs": {"evidence": "", "source": "proposed"}, "Outputs": {"evidence": "1.6 Raise IT, Facilities and L&D sub-tickets in ServiceNow; §3 IT Service Desk, Facilities, Learning & Development responsibilities", "source": "document"}, "What happens": {"evidence": "1.6 Raise IT, Facilities and L&D sub-tickets in ServiceNow | HR Ops | T-7", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
updatedBy: admin
updatedAt: 2026-05-25T13:52:35Z
---
## What happens
HR Operations raises sub-tickets in ServiceNow for IT Service Desk (device provisioning and access), Facilities (desk, building pass, parking), and Learning & Development (training curriculum assignment). These are the three functions listed in step 1.6 and the corresponding fulfilment roles in §3. The description of 'child tickets off a master onboarding ticket' is an inference; the document simply states sub-tickets are raised.

## Inputs
- Master ServiceNow onboarding ticket
- Confirmed equipment list (from ps-5)
- New hire role and start date

## Outputs
- IT sub-ticket raised
- Facilities sub-ticket raised
- L&D sub-ticket raised

## Why it matters
Formal sub-tickets in ServiceNow give IT, Facilities, and L&D trackable work orders to fulfil their pre-boarding responsibilities ahead of Day 1.

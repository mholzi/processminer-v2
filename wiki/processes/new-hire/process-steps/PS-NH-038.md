---
id: PS-NH-038
type: process-step
section: process-steps
title: Ship device pre-imaged and enrolled in MDM
status: draft
source: new-hr-onboarding-dtp.md
owner: IT Service Desk
sla: T-2
condition: Equipment list confirmed (ps-5)
systems: [SYS-NH-006]
transitions: [PS-NH-039|normal|always, EX-NH-015|exception|device not shipped by T-2]
provenance: {"Inputs": {"evidence": "1.5 Confirm equipment list with hiring manager (role template + exceptions); §5 Intune / Jamf: Device enrolment", "source": "document"}, "Outputs": {"evidence": "1.9 Ship device pre-imaged and enrolled in MDM; §8 Equipment delayed beyond Day 1 | Issue loaner kit from local hub", "source": "document"}, "What happens": {"evidence": "1.9 Ship device pre-imaged and enrolled in MDM | IT | T-2; §5 Intune / Jamf: Device enrolment", "source": "document"}, "Why it matters": {"evidence": "§9 Day-1 readiness (laptop, access, desk all in place) | ≥ 95%", "source": "document"}}
updatedBy: admin
updatedAt: 2026-05-25T13:52:52Z
---
## What happens
IT Service Desk images the device with the corporate build, enrols it in Intune or Jamf MDM (§5), and ships it to the new hire. The specific shipping destination (home address or office) and the detail of updating ServiceNow with a tracking reference are not stated in the source and have been removed.

## Inputs
- Confirmed equipment list with kit specification
- MDM platform (Intune / Jamf) for device enrolment

## Outputs
- Device imaged and MDM-enrolled
- Device shipped
- Loaner kit issued if delivery delayed (exception §8)

## Why it matters
Day-1 readiness (target ≥ 95%, §9) requires a functioning, company-managed device on the hire's first day.

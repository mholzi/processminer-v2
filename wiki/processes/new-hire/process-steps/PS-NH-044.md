---
id: PS-NH-044
type: process-step
section: process-steps
title: First login, MFA enrolment and password reset
status: draft
source: new-hr-onboarding-dtp.md
owner: IT Service Desk
condition: Okta account and device provisioned pre-Day 1 (ps-8, ps-9)
systems: [SYS-NH-005, SYS-NH-006]
transitions: [PS-NH-045|normal|first login successful and MFA enrolled, EX-NH-015|exception|device not received by Day 1]
provenance: {"Inputs": {"evidence": "", "source": "proposed"}, "Outputs": {"evidence": "", "source": "proposed"}, "What happens": {"evidence": "2.3 First login, MFA enrolment, password reset | IT / New Hire", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
updatedBy: admin
updatedAt: 2026-05-25T13:52:52Z
---
## What happens
IT and the new hire complete the first login on the provisioned device, enrol in multi-factor authentication (Okta), and complete the mandatory password reset. Device enrolment in Intune or Jamf (MDM) is verified.

## Inputs
- Pre-imaged device enrolled in MDM (ps-9)
- Temporary Okta credentials issued during provisioning (ps-8)
- IT sub-ticket in ServiceNow (ps-6)

## Outputs
- New hire successfully logged in with permanent Okta credentials
- MFA factor enrolled and verified
- Device confirmed enrolled in MDM

## Why it matters
Completing MFA enrolment and password reset on Day 1 activates the identity security controls required by the Acceptable Use Policy (POL-IS-002) and is a prerequisite for access to company systems.

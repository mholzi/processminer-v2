---
id: PS-NH-037
type: process-step
section: process-steps
title: Provision Okta account, email and role-based access
status: draft
source: new-hr-onboarding-dtp.md
owner: IT Service Desk
sla: T-3
condition: Background screening returned 'clear' (Control CTL-NHO-01); Workday employee record created (ps-7)
systems: [SYS-NH-005, SYS-NH-001]
transitions: [PS-NH-038|normal|always]
provenance: {"Inputs": {"evidence": "CTL-NHO-01: HireRight report + IT provisioning timestamp; §5 Okta / AD: Identity and SSO provisioning", "source": "document"}, "Outputs": {"evidence": "1.8 Provision Okta account, email, role-based access entitlements; CTL-NHO-01: IT provisioning timestamp as evidence", "source": "document"}, "What happens": {"evidence": "1.8 Provision Okta account, email, role-based access entitlements | IT | T-3; CTL-NHO-01: No system access provisioned before background screening returns 'clear'; CTL-NHO-04: Role-based access reviewed and approved by line manager before grant", "source": "document"}, "Why it matters": {"evidence": "CTL-NHO-01: No system access provisioned before background screening returns 'clear'; CTL-NHO-04: Role-based access reviewed and approved by line manager before grant", "source": "document"}}
updatedBy: admin
updatedAt: 2026-05-25T13:52:52Z
---
## What happens
IT Service Desk provisions the new hire's Okta account and corporate email address, then assigns role-based access entitlements. Access grants must be approved by the line manager before activation (Control CTL-NHO-04). Provisioning is gated by a clear background screening result — no access is granted until HireRight returns 'clear' (Control CTL-NHO-01).

## Inputs
- Clear HireRight background screening result
- Workday employee record and employee ID
- Role-based access entitlements from IT sub-ticket
- Line manager approval for access grants (CTL-NHO-04)

## Outputs
- Okta account and corporate email provisioned
- Role-based access entitlements assigned and approved
- Provisioning timestamp recorded (evidence for CTL-NHO-01)

## Why it matters
Access provisioned before background screening clears is a direct control breach (CTL-NHO-01). Mandatory line manager approval before access grant enforces CTL-NHO-04.

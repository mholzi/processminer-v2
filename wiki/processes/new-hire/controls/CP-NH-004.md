---
id: CP-NH-004
type: control
section: controls
title: Role-based access reviewed and approved by line manager
status: draft
confidence: high
source: new-hr-onboarding-dtp.md
controlType: PREVENTIVE
execution: MANUAL
owner: IT Service Desk
step: [ps-5, ps-8, ps-23]
provenance: {"Control activity": {"evidence": "Step 1.5: Confirm equipment list with hiring manager (role template + exceptions) | Hiring Manager | T-7. Step 1.6: Raise IT, Facilities and L&D sub-tickets in ServiceNow | HR Ops | T-7. Step 1.8: Provision Okta account, email, role-based access entitlements | IT | T-3. CTL-NHO-04 evidence: ServiceNow approval audit trail.", "source": "document"}, "Risk addressed": {"evidence": "", "source": "proposed"}, "Timing": {"evidence": "CTL-NHO-04 | Role-based access reviewed and approved by line manager before grant | Per hire | ServiceNow approval audit trail", "source": "document"}, "What it checks": {"evidence": "CTL-NHO-04 | Role-based access reviewed and approved by line manager before grant | Per hire | ServiceNow approval audit trail.", "source": "document"}}
updatedBy: admin
updatedAt: 2026-05-25T14:01:22Z
---
## What it checks
Whether the access entitlements to be granted match the new hire's role profile and have been explicitly approved by their line manager before provisioning occurs.

## Control activity
The hiring manager confirms the equipment and access entitlement list (role template plus exceptions) at step 1.5 (T-7). IT Service Desk provisions Okta account and role-based access (step 1.8) after the ServiceNow sub-ticket is raised (step 1.6). The ServiceNow approval audit trail constitutes evidence of the manager's sign-off.

## Risk addressed
Without manager approval, access could be provisioned beyond the new hire's legitimate role scope, violating least-privilege principles and increasing the risk of data leakage, fraud or audit failure.

## Timing
Per hire, during pre-boarding. Manager confirmation at T-7 gates provisioning at T-3.

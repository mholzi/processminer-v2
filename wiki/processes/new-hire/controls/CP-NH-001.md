---
id: CP-NH-001
type: control
section: controls
title: No system access before background screening clear
status: draft
confidence: high
source: new-hr-onboarding-dtp.md
controlType: PREVENTIVE
execution: HYBRID
owner: Compliance / Risk
step: [ps-3, ps-8, ps-12]
provenance: {"Control activity": {"evidence": "Step 1.3: Initiate background and right-to-work checks via HireRight | Compliance | T-10. Step 1.12: Final go/no-go check: background clear, contract signed, kit shipped | HR Ops | T-1. Step 1.8: Provision Okta account, email, role-based access entitlements | IT | T-3. CTL-NHO-01 evidence: HireRight report + IT provisioning timestamp.", "source": "document"}, "Risk addressed": {"evidence": "", "source": "proposed"}, "Timing": {"evidence": "CTL-NHO-01 frequency: Per hire. Step 1.8: Provision Okta account, email, role-based access entitlements | IT | T-3.", "source": "document"}, "What it checks": {"evidence": "CTL-NHO-01 | No system access provisioned before background screening returns \"clear\" | Per hire | HireRight report + IT provisioning timestamp", "source": "document"}}
updatedBy: admin
updatedAt: 2026-05-25T13:52:20Z
---
## What it checks
Whether a clear background screening result has been returned by HireRight before any system access is provisioned to the new hire.

## Control activity
Compliance / Risk initiates the HireRight background screening report (step 1.3). IT Service Desk holds provisioning until a clear result is confirmed. HR Operations verifies the clear status at the final go/no-go check (step 1.12) before IT proceeds. Provisioning timestamps are recorded alongside the HireRight report as evidence.

## Risk addressed
Without this control, a new hire with an adverse background could gain system access before the organisation discovers the disqualifying finding, exposing the firm to regulatory, reputational and security risk.

## Timing
Per hire. The check runs during pre-boarding (Phase 1) and must clear before the Okta account and role-based access entitlements are provisioned at step 1.8.

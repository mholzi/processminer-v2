---
id: PS-NH-003
type: process-step
section: process-steps
title: Initiate background and right-to-work checks
status: draft
source: new-hr-onboarding-dtp.md
owner: Compliance / Risk
sla: T-10
condition: Onboarding workflow triggered in Workday; new hire personal details available from offer record
systems: [SYS-NH-004]
transitions: [PS-NH-004|normal|checks pass, EX-NH-007|exception|adverse finding]
provenance: {"Inputs": {"evidence": "", "source": "proposed"}, "Outputs": {"evidence": "", "source": "proposed"}, "What happens": {"evidence": "1.3 Initiate background and right-to-work checks via HireRight | Compliance | T-10; §3 Compliance / Risk: Background screening, regulatory references, sanctions/PEP checks; CTL-NHO-01: No system access provisioned before background screening returns 'clear'", "source": "document"}, "Why it matters": {"evidence": "CTL-NHO-01: No system access provisioned before background screening returns 'clear' | Per hire | HireRight report + IT provisioning timestamp", "source": "document"}}
updatedBy: admin
updatedAt: 2026-05-25T13:52:35Z
---
## What happens
Compliance / Risk initiates background screening and right-to-work verification via HireRight. Per §3, the Compliance / Risk role covers background screening, regulatory references, and sanctions/PEP checks. Results must return 'clear' before IT provisioning can proceed (Control CTL-NHO-01). Employment history is not listed in the source as a check type and has been removed.

## Inputs
- Candidate personal details from offer record
- HireRight system access

## Outputs
- HireRight screening case opened
- Screening result (clear / adverse) available to HR Ops

## Why it matters
Control CTL-NHO-01 prohibits system access provisioning before a clear background result. Initiating at T-10 gives maximum lead time before the T-3 provisioning step.

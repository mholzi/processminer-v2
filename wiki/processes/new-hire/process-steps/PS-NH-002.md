---
id: PS-NH-002
type: process-step
section: process-steps
title: Send welcome email with pre-boarding portal link
status: draft
source: new-hr-onboarding-dtp.md
owner: HR Operations
sla: T-10
condition: Onboarding workflow triggered in Workday (ps-1 complete)
systems: [SYS-NH-001]
transitions: [PS-NH-003|normal|always]
provenance: {"Inputs": {"evidence": "", "source": "proposed"}, "Outputs": {"evidence": "", "source": "proposed"}, "What happens": {"evidence": "1.2 Send welcome email with pre-boarding portal link | HR Ops | T-10", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-25T13:56:12Z
---
## What happens
HR Operations sends a welcome email to the new hire that includes a link to the pre-boarding portal. The document records this as step 1.2; specific content of the email beyond the portal link is not described in the source.

## Inputs
- New hire contact details
- Pre-boarding portal link

## Outputs
- Welcome email sent to new hire with pre-boarding portal link
- New hire has access to the pre-boarding portal to begin completing pre-boarding tasks

## Why it matters
Sending the welcome email at T-10 gives the new hire early access to the pre-boarding portal, enabling timely completion of pre-boarding tasks ahead of subsequent T-7 deadlines.

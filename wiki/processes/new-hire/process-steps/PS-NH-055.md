---
id: PS-NH-055
type: process-step
section: process-steps
title: HR onboarding pulse survey
status: draft
source: new-hr-onboarding-dtp.md
owner: HR Operations
sla: Day 30
condition: 30-day check-in completed
systems: [SYS-NH-001]
transitions: [PS-NH-056|normal|survey response received or window closed]
provenance: {"Inputs": {"evidence": "", "source": "proposed"}, "Outputs": {"evidence": "§9 — 'Onboarding NPS (30-day survey) | ≥ +40'", "source": "document"}, "What happens": {"evidence": "4.3 — 'HR onboarding pulse survey | HR Ops | Day 30'", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
updatedBy: admin
updatedAt: 2026-05-25T13:52:52Z
---
## What happens
HR Operations sends an onboarding pulse survey to the new hire at Day 30, collecting feedback on the onboarding experience. Results feed the onboarding NPS metric.

## Inputs
- New hire employee record
- Confirmation that Day 30 mark has been reached

## Outputs
- Completed survey response
- Onboarding NPS score contribution (target ≥ +40 per §9)

## Why it matters
The pulse survey captures the new hire's experience while it is fresh. A low score signals onboarding gaps that, left unaddressed, increase 90-day attrition risk.

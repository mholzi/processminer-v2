---
id: PS-NH-042
type: process-step
section: process-steps
title: Greet new hire and complete right-to-work verification
status: draft
source: new-hr-onboarding-dtp.md
owner: HR Operations
condition: New hire arrives on Day 1; final go/no-go check passed (ps-12)
systems: []
transitions: [PS-NH-043|normal|right-to-work verified and new hire greeted, EX-NH-016|exception|right-to-work documentation incomplete]
provenance: {"Inputs": {"evidence": "", "source": "proposed"}, "Outputs": {"evidence": "", "source": "proposed"}, "What happens": {"evidence": "", "source": "proposed"}, "Why it matters": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-25T13:57:09Z
---
## What happens
HR Operations greets the new hire on Day 1 and conducts the I-9 or right-to-work verification in person, as required by step 2.1 and control CTL-NHO-03.

## Inputs
- Employee record created in Workday (ps-7)
- Day-1 logistics email confirming arrival (ps-11)

## Outputs
- Signed I-9 / RTW form filed in the employee record
- New hire formally admitted and greeted

## Why it matters
Right-to-work verification on or before Day 1 is required by Control CTL-NHO-03. Where documentation is incomplete, employment must not start (see exceptions §8).

---
id: PS-FR-004
type: process-step
section: process-steps
title: First-line approval
status: draft
confidence: high
source: funds-release-dtp-mockup.md
sequence: 4
owner: Ops Analyst
systems: [SYS-FR-001]
transitions: [PS-FR-005|branch|release ≥ EUR 5M, PS-FR-006|branch|release < EUR 5M]
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-17
---
## What happens
A second Ops Analyst — who must not be the analyst who validated the request at PS-FR-002 — reviews the validation and compliance screening results and grants first-line approval. This is a manual step performed on every release, including clean straight-through items. If the analyst finds the validation or screening results unsatisfactory, the payment is cancelled rather than progressed. A first-line-approved item moves toward independent authorisation.

## Inputs
- The validated and screened release request
- The validation and screening results, for review
- The identity of the validating analyst, so the first-line approver can be confirmed as a different person

## Outputs
- A first-line-approved release request cleared toward independent authorisation
- Confirmation that validation and screening checks have passed
- A cancelled payment where the analyst finds the validation or screening results unsatisfactory

## Why it matters
First-line approval places accountability for the validation and screening outcome with a named analyst — separate from the one who validated the request — before the item reaches independent authorisation. It is also the point at which an item that should not proceed is cancelled rather than passed on.

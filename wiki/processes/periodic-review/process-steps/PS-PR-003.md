---
id: PS-PR-003
type: process-step
section: process-steps
title: STP Decision
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
owner: STP Decision Engine
sla:
condition: Case completeness score ≥ 92 and risk rating Low or Medium and no open screening hit and no event-based trigger and product mix unchanged
systems: [SYS-PR-003, SYS-PR-001, SYS-PR-008, SYS-PR-006]
---
## What happens
The STP Decision Engine evaluates the case against eligibility criteria: Low or Medium risk rating, completeness score ≥ 92, no open screening hit, no event-based trigger and product mix unchanged. If eligible, the engine auto-approves: it refreshes the risk rating, writes the new nextReviewDate to the client master, posts the decision and full evidence snapshot to the Audit Ledger, and notifies the RM (FYI only — no client contact). If ineligible, the case is routed to Reviewer Triage with the reason spelt out (e.g. 'ID document expires in < 90 days').

## Inputs
- Pre-filled KYC case with completeness score and STP eligibility flag
- Risk rating from Risk Rating Service
- Open screening hits from Screening Service
- Event-based trigger flag and product-mix change flag from case record

## Outputs
- STP approval decision recorded in Audit Ledger with full evidence snapshot (eligible path)
- Refreshed risk rating and updated nextReviewDate written to client master (eligible path)
- RM FYI notification (eligible path)
- Ineligibility reason code routed to Step 4 or Step 5 (ineligible path)

## Why it matters
Approximately 62% of Low- and Medium-risk reviews are expected to complete straight-through with no client contact, reducing median cycle time for Low-risk to 0 days and cutting RM hours per review from 3.2 h to 0.6 h by Year 1.

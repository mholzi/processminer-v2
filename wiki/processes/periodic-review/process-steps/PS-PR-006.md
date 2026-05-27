---
id: PS-PR-006
type: process-step
section: process-steps
title: Sign-off
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
owner: Financial Crime Officer
sla:
condition: 4-eyes sign-off mandatory for: High-risk clients, PEPs, recommend-exit decisions, approve-with-conditions where the condition restricts a regulated product, and random 5% QA sample of STP and analyst approvals
systems: [SYS-PR-001, SYS-PR-008, SYS-PR-005]
---
## What happens
The Financial Crime Officer (FCO) applies the 4-eyes principle to every case that reaches this step. Sign-off is mandatory for High-risk clients, PEPs, recommend-exit decisions, approve-with-conditions decisions where the condition restricts a regulated product, and a random 5% QA sample of STP and analyst approvals. The FCO reviews the full evidence pack, the analyst's decision and rationale, and makes a final determination. Sign-off is recorded against the FCO's identity (SSO) and is immutable.

## Inputs
- Full case including analyst decision and rationale from Step 5
- Evidence pack with provenance links
- Open screening hits (Screening Service re-run at sign-off)
- QA sample flag if triggered by random selection

## Outputs
- Immutable FCO sign-off recorded against the FCO's SSO identity
- Final decision (approve / approve with conditions / exit / restriction) confirmed
- Case ready for close-out at Step 7

## Why it matters
Mandatory 4-eyes FCO sign-off on High-risk, PEP and exit cases closes the As-Is compliance gap where escalation depended on the analyst on duty rather than a written rule, directly addressing the BaFin and internal audit findings.

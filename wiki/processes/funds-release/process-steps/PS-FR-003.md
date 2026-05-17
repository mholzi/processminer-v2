---
id: PS-FR-003
type: process-step
section: process-steps
title: Compliance screening
status: draft
confidence: high
source: funds-release-dtp-mockup.md
sequence: 3
owner: Ops Analyst
systems: [SYS-FR-003]
transitions: [PS-FR-004|normal|clean or cleared, EX-FR-002|exception|confirmed hit]
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-17
---
## What happens
Every validated release item is screened automatically by the Sanctions Screening Engine for sanctions and AML hits. Only the beneficiary is screened at this step; the drawing customer is not re-screened here. A clean item passes straight through with no manual handling and continues to first-line approval. A potential hit takes the item off the automatic path and routes it to Compliance for adjudication: a false-positive match is cleared and the item resumes, while a confirmed match is handled as exception E-2. The Ops Analyst owns the workflow item throughout; Compliance is involved only when a hit is routed for adjudication.

## Inputs
- The validated release request
- The beneficiary's details, screened against sanctions and AML lists

## Outputs
- A clean item cleared automatically and continued to first-line approval
- A potential hit routed to Compliance for adjudication
- A false-positive match cleared by Compliance, with the item resumed
- A confirmed match handled as exception E-2

## Why it matters
Sanctions and AML screening is the bank's compliance checkpoint; preventing the release of funds to a sanctioned or flagged beneficiary is what this step exists to do.

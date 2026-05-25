---
id: PS-FR-003
type: process-step
section: process-steps
title: Compliance screening
status: draft
confidence: high
source: funds-release-dtp-mockup.md
owner: Sanctions Screening Engine (SYS-FR-003) for automated screening; Compliance for adjudication of potential hits
systems: [SYS-FR-003]
transitions: [PS-FR-004|normal|when screening is clear automatically or a potential hit is adjudicated a false positive, EX-FR-002|exception|when a sanctions or AML hit is confirmed]
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-17
---
## What happens
Every item is screened automatically by the sanctions screening engine against sanctions lists and AML rules. A clean item passes straight through. An item with a potential hit is routed to Compliance, which adjudicates it: a false positive is cleared back into the flow and a genuine hit is confirmed as an exception. Screening covers the named beneficiary and the beneficiary bank or correspondent; the underlying facility obligor is screened at facility origination and is not re-screened at release.

## Inputs
- Validated release request
- Beneficiary and beneficiary-bank / correspondent details for screening
- Sanctions lists and AML rules held in the screening engine

## Outputs
- Screening result — clean, false positive cleared by Compliance, or confirmed hit
- Clean and analyst-cleared items passed to first-line approval
- Items with a confirmed hit routed to EX-FR-002
- Adjudication disposition — cleared or confirmed, adjudicator name and rationale — recorded in the workflow tool audit log

## Why it matters
Sanctions and AML screening prevents the bank from releasing funds to a sanctioned or illicit party — including through a sanctioned beneficiary bank or correspondent — a core financial-crime and regulatory safeguard.

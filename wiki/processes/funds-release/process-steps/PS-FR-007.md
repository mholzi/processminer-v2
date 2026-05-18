---
id: PS-FR-007
type: process-step
section: process-steps
title: Execute release
status: draft
confidence: high
source: funds-release-dtp-mockup.md
owner: Core Banking System (SYS-FR-002) posts STP items automatically; Operations Analyst posts non-STP items manually
systems: [SYS-FR-001, SYS-FR-002]
transitions: [PS-FR-008|normal|when the posting succeeds, EX-FR-005|exception|when the posting fails at execution]
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-17
---
## What happens
The approved item is posted in the core banking system, moving funds from the held account to the beneficiary instruction. For an STP item the workflow tool posts directly; a non-STP item is posted by the Operations Analyst. The 14:00 CET same-day-value cut-off is enforced here: an item reaching execution after 14:00 posts with next-day value, and is held to the next business day if next-day value is unacceptable to the front office. A posting can fail — insufficient held-account funds or a core banking rejection — routing the item to EX-FR-005.

## Inputs
- Second-line authorised release request
- Beneficiary instruction details
- Held-account balance and the 14:00 CET same-day-value cut-off
- The STP-eligibility flag on the item

## Outputs
- Posted fund movement in the core banking system
- Funds transferred from the held account to the beneficiary
- Items posted after 14:00 CET carrying next-day value or held to the next business day
- Failed postings routed to EX-FR-005

## Why it matters
Execution is the point at which value actually moves; posting only fully approved items ensures funds are released solely on a complete control chain. Enforcing the cut-off here keeps the value date accurate, and routing a failed posting to EX-FR-005 ensures a consumed-funding or rejection failure is caught.

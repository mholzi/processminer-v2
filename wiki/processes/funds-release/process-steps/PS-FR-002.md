---
id: PS-FR-002
type: process-step
section: process-steps
title: Validate request
status: draft
confidence: high
source: funds-release-dtp-mockup.md
sequence: 2
owner: Ops Analyst
systems: [SYS-FR-001, SYS-FR-005]
transitions: [PS-FR-003|normal|validated, EX-FR-001|exception|validation fails]
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-17
---
## What happens
The Ops Analyst checks the request for completeness and validity: that the facility ID exists and is in 'Active' status, that the requested amount does not exceed the available undrawn limit, that the value date is a valid business day for the currency, and that supporting documents such as the drawdown notice and invoice are attached. If validation fails, the item is handled as exception E-1.

## Inputs
- The queued release request with its facility ID, amount, currency and value date
- Supporting documents — the drawdown notice and invoice
- Facility status and the available undrawn limit

## Outputs
- A validated release request cleared to proceed to compliance screening
- An item returned to the front office with a reason code where validation fails

## Why it matters
Validation stops incomplete or out-of-limit requests early, before screening and approval effort is spent, and prevents a release exceeding the approved facility.

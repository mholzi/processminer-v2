---
id: PS-FR-002
type: process-step
section: process-steps
title: Validate request
status: draft
confidence: high
source: funds-release-dtp-mockup.md
owner: Operations Analyst — on items that fail an automated check or are not STP-eligible; STP-eligible clean items are checked automatically by the payments workflow tool with no human actor
systems: [SYS-FR-001, SYS-FR-005]
transitions: [PS-FR-003|normal|when the request is valid and complete, EX-FR-001|exception|when validation fails]
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-17
---
## What happens
Validation is automated-first. For an STP-eligible item the payments workflow tool automatically runs four checks: facility ID exists and is Active, amount within the available undrawn limit (the CP-FR-001 limit check), value date a valid calendar business day for the currency, and drawdown notice and invoice attached. A clean item flows straight through. The Operations Analyst handles only items that fail a check or are not STP-eligible. The business-day check confirms only a valid business day; it does not resolve a value date on a weekend or holiday (PG-FR-004).

## Inputs
- Release request item from the queue, with its supporting documents
- Facility status and available undrawn limit from the facility management system
- The STP-eligibility flag on the item

## Outputs
- Validated release request — facility, limit, value-date and document checks confirmed
- STP-eligible clean items passed automatically to compliance screening
- Expired or in-default facilities failed straight to EX-FR-001
- Suspended or under-review facilities informally bounced back to the front office to clarify with Credit — no exception logged today

## Why it matters
Validation stops incomplete or non-compliant requests — exceeded limits, expired or defaulted facilities, missing documents — from entering the release flow, and lets clean STP items pass without analyst effort. Inconsistent handling of suspended facilities and non-business-day value dates remains a documented gap.

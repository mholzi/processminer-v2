---
id: PS-FR-005
type: process-step
section: process-steps
title: Liquidity confirmation
status: draft
confidence: high
source: funds-release-dtp-mockup.md
owner: Treasury
condition: Amount at or above the fixed EUR 5,000,000 threshold — non-EUR amounts FX-converted at the release-day rate
systems: [SYS-FR-004]
transitions: [PS-FR-006|normal|when funding is available, EX-FR-003|exception|when funding is unavailable]
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-17
---
## What happens
For releases at or above the Treasury threshold — a fixed EUR 5,000,000, with non-EUR amounts FX-converted at the release-day rate — Treasury confirms on the liquidity platform that funding is available for the value date. The confirmation is a point-in-time availability check only; it does not earmark or reserve the funding against this release. Confirmation must land before the 14:00 CET same-day-value cut-off, or the release rolls to the next value date. If funding is unavailable the release is deferred. Releases below EUR 5m skip this step and, when otherwise clean, are STP-eligible.

## Inputs
- First-line approved release request at or above the EUR 5m threshold
- Requested amount and value date, with the release-day FX rate for non-EUR amounts
- Funding-availability position from the Treasury liquidity platform

## Outputs
- Treasury funding confirmation for the value date — a point-in-time check, not an earmark
- Items confirmed before the 14:00 CET cut-off retaining same-day value
- Deferral and reschedule to the next value date where funding is unavailable or confirmation misses the cut-off

## Why it matters
Confirming funding for large releases protects the bank's liquidity position and prevents committing funds that are not available on the value date. Because the confirmation does not earmark the funding, the protection is only partial — see PP-FR-001.

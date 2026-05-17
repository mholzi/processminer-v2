---
id: PS-FR-007
type: process-step
section: process-steps
title: Execute release
status: draft
confidence: high
source: funds-release-dtp-mockup.md
sequence: 7
owner: Ops Analyst
systems: [SYS-FR-002]
transitions: [PS-FR-008|normal|posted]
---
## What happens
The approved item is posted in the core banking system and funds move from the held account to the beneficiary instruction. A release reaches same-day value only where it is executed before the 14:00 CET cut-off.

## Inputs
- The authorised release request
- The held account balance and the beneficiary instruction

## Outputs
- A posted fund movement from the held account to the beneficiary
- An updated core banking record of the release

## Why it matters
Execution is the point at which funds leave the bank's held account, so it proceeds only on a fully validated, screened and dual-approved item.

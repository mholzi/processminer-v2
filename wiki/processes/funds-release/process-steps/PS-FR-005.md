---
id: PS-FR-005
type: process-step
section: process-steps
title: Liquidity confirmation
status: draft
confidence: high
source: funds-release-dtp-mockup.md
sequence: 5
owner: Treasury
systems: [SYS-FR-004]
transitions: [PS-FR-006|normal|funding confirmed, EX-FR-003|exception|funding unavailable]
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-17
---
## What happens
For releases at or above the Treasury threshold — currently EUR 5,000,000 equivalent — Treasury confirms that funding is available for the value date. Releases below the threshold skip straight to four-eyes approval. If funding is unavailable, the item is handled as exception E-3.

## Inputs
- The first-line-approved release request
- The release amount and value date

## Outputs
- Treasury confirmation that funding is available for the value date
- A deferred release where funding is unavailable

## Why it matters
Confirming funding before a large release is posted prevents the bank releasing funds it cannot cover on the value date.

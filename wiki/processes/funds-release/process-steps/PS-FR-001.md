---
id: PS-FR-001
type: process-step
section: process-steps
title: Receive request
status: draft
confidence: high
source: funds-release-dtp-mockup.md
sequence: 1
systems: [SYS-FR-001]
transitions: [PS-FR-002|normal|request received]
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-17
---
## What happens
A release request arrives in the Operations queue through the payments workflow tool. It is triggered by a front-office drawdown request against an approved facility, a held payment reaching its scheduled release date, or an operations analyst manually initiating release of a flagged item; all three enter the queue the same way, carrying a facility ID, amount, currency, value date and beneficiary details. An item's receipt timestamp is set on arrival in the Operations queue, and this is the point from which the release SLA is measured.

## Inputs
- A front-office drawdown request against an approved facility
- A held payment that has reached its scheduled release date
- An operations analyst's manual initiation of a flagged item

## Outputs
- A release request held as an item in the Operations queue
- Facility ID, amount, currency and value date recorded on the item
- Beneficiary details attached to the item

## Why it matters
Bringing every release into a single queue with its key data is what lets the process route, control and audit each item consistently.

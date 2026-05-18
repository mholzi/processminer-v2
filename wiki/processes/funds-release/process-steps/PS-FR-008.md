---
id: PS-FR-008
type: process-step
section: process-steps
title: Confirm & close
status: draft
confidence: high
source: funds-release-dtp-mockup.md
owner: Payments Workflow Tool (SYS-FR-001) confirms and closes STP items automatically; Operations Analyst confirms and closes non-STP items
systems: [SYS-FR-001]
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-17
---
## What happens
A confirmation is sent to the release originator — to the front office for a front-office drawdown request, to the initiating analyst or flagging team for a manual initiation, and to no external desk for an auto-released held payment. The workflow item is then closed. For an STP item the workflow tool sends the confirmation and closes the item automatically; a non-STP item is closed by the Operations Analyst. The audit log records every actor and timestamp — for an STP item the actor at each automated step is recorded as 'system'.

## Inputs
- Posted fund movement confirmation
- Originator identity for routing the confirmation
- Actor and timestamp data from the workflow
- The STP-eligibility flag on the item

## Outputs
- Release confirmation sent to the originator — front office, initiating analyst, or none for an auto-released held payment
- Closed workflow item
- Complete audit trail of actors and timestamps, with system actors recorded for STP steps

## Why it matters
Confirmation and a complete audit trail close the loop with the originator and give a reviewable record of every actor and timestamp. For an STP release that record shows only system actors and no human approver — a 4-eyes audit weakness tracked in control gap CG-FR-001.

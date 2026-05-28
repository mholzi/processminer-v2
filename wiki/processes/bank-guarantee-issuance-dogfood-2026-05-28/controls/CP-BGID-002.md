---
id: CP-BGID-002
type: control
section: controls
title: Sanctions Screening
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
controlType: PREVENTIVE
execution: HYBRID
effectiveness: HIGH
owner: Compliance
step: [PS-BGID-004]
regulatedBy: [REG-BGID-001]
updatedBy: the assistant
updatedAt: 2026-05-28T14:14:56Z
approval: approved
approvalBy: admin
approvalDate: 2026-05-28
---
## What it checks
Screens the guarantee beneficiary and the beneficiary's country against applicable sanctions lists before issuance proceeds.

## Control activity
The Compliance Analyst initiates a search in the Sanctions Screening Tool, which performs the automated matching against the sanctions list. The screening result is attached to the application. A hit suspends the application and triggers a hand-off to Compliance Operations for investigation before any further processing.

## Risk addressed
Issuing a guarantee to or for the benefit of a sanctioned party, exposing the bank to regulatory breach, enforcement action and reputational damage.

## Timing
Runs on every application at PS-BGID-004, after wording review and before issuance approval, as a mandatory pre-issuance gate.

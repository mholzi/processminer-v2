---
id: CP-FR-002
type: control
section: controls
title: Sanctions & AML screening
status: draft
confidence: high
source: funds-release-dtp-mockup.md
controlType: PREVENTIVE
execution: AUTOMATED
owner: Compliance
step: PS-FR-003
regulatedBy: [REG-FR-001, REG-FR-002]
---
## What it checks
Whether the release item or its beneficiary returns a sanctions or AML screening hit.

## Control activity
An automated, preventive screening engine checks every item in real time; clean items pass and potential hits are routed to Compliance for adjudication.

## Risk addressed
Releasing funds to a sanctioned party or a party linked to financial crime.

## Timing
Runs automatically on every release item during compliance screening.

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
effectiveness: MEDIUM
owner: Financial Crime / Sanctions team, Compliance
step: [PS-FR-003]
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-17
regulatedBy: [REG-FR-001, REG-FR-002, REG-FR-003, REG-FR-008, REG-FR-014]
---
## What it checks
Whether the named beneficiary or the beneficiary bank / correspondent matches a sanctions list or triggers an AML alert.

## Control activity
An automated screening engine screens every item in real time against sanctions and AML lists; clean items pass automatically and potential hits are routed to Compliance for adjudication.

## Risk addressed
Releasing funds to a sanctioned party — including through a sanctioned beneficiary bank — or otherwise facilitating money laundering.

## Timing
Runs automatically in real time on every release item. Effectiveness is rated MEDIUM: it carries inherent false-negative exposure from list freshness, name-matching fuzziness and no screening of the underlying obligor at release.

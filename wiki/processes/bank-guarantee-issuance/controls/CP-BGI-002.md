---
id: CP-BGI-002
type: control
section: controls
title: Sanctions Screening
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
controlType: PREVENTIVE
execution: AUTOMATED
owner: Compliance Analyst
step: [PS-BGI-004]
approval: in-progress
regulatedBy: [REG-BGI-001, REG-BGI-012]
---
## What it checks
That every beneficiary and beneficiary country is screened against the sanctions list before issuance is approved.

## Control activity
The Compliance Analyst initiates the screen in the Sanctions Screening Tool for the beneficiary and beneficiary country; the tool automatically performs the matching and writes the screening result to the application record.

## Risk addressed
Inadvertent issuance of a guarantee to a sanctioned entity or country.

## Timing
Performed at step 4 for every application before issuance approval is sought.

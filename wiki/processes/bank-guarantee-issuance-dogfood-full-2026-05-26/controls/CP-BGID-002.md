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
owner: Compliance Analyst
step: [PS-BGID-004]
regulatedBy: [REG-BGID-001, REG-BGID-004]
updatedBy: the assistant
updatedAt: 2026-05-26T06:50:15Z
---
## What it checks
Every beneficiary and beneficiary country is checked against the sanctions list before a guarantee is issued.

## Control activity
A Compliance Analyst screens the beneficiary and the beneficiary's country using the Sanctions Screening Tool. The screening result is attached to the application record. A screening hit suspends the application pending a Compliance investigation.

## Risk addressed
Without this control, the bank risks issuing a guarantee in favour of a sanctioned party or into a sanctioned jurisdiction, exposing it to regulatory penalties and reputational damage.

## Timing
The control runs at the Sanctions and Compliance Screening step, once per application, before issuance approval is sought.

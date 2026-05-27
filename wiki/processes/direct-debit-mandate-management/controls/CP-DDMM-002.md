---
id: CP-DDMM-002
type: control
section: controls
title: Sanctions Screening of Parties
status: draft
confidence: high
source: ddmm-dtp-mockup.md
controlType: PREVENTIVE
execution: AUTOMATED
owner: Compliance
step: [PS-DDMM-003]
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
regulatedBy: [REG-DDMM-002, REG-DDMM-003]
---
## What it checks
That neither the debtor nor the creditor named in the mandate appears on applicable sanctions lists. Applies to new mandates and to amendments that change a party name; skipped for non-name amendments and for cancellations.

## Control activity
The Sanctions Screening Engine automatically screens both party names against sanctions lists on every request. Potential hits are escalated to Compliance for manual adjudication.

## Risk addressed
Registration of a mandate for a sanctioned party, which would constitute a regulatory violation and expose the bank to financial crime risk.

## Timing
Runs after data validation on new mandates and party-name-changing amendments; not executed for non-name amendments or cancellations.

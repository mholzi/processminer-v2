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
provenance: {"Control activity": {"evidence": "C-2 | Sanctions screening of debtor and creditor | Preventive / automated | Every request. Potential hits are routed to Compliance for adjudication.", "source": "document"}, "Risk addressed": {"evidence": "SME confirmed accurate as drafted.", "source": "elicited"}, "Timing": {"evidence": "SME confirmed: runs after validation on new mandates and party-name-changing amendments only; skipped for non-name amendments and cancellations.", "source": "elicited"}, "What it checks": {"evidence": "SME (M. Vogel) confirmed: screening is type-aware — runs on new mandates and party-name-changing amendments; skipped for non-name amendments and cancellations. 'Every request' would misstate coverage to an auditor.", "source": "elicited"}}
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

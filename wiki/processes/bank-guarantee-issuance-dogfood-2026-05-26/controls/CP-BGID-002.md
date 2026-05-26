---
id: CP-BGID-002
type: control
section: controls
title: Sanctions Screening
status: draft
source: bank-guarantee-issuance-v1.md
controlType: PREVENTIVE
execution: HYBRID
effectiveness:
owner: Compliance
step: [PS-BGID-004]
regulatedBy: [REG-BGID-001]
provenance: {"Control activity": {"evidence": "", "source": "proposed"}, "Risk addressed": {"evidence": "", "source": "proposed"}, "Timing": {"evidence": "", "source": "proposed"}, "What it checks": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-26T05:17:42Z
---
## What it checks
Checks that neither the beneficiary nor the beneficiary's country appears on an applicable sanctions list before the guarantee is issued.

## Control activity
The Compliance Analyst screens the beneficiary and beneficiary country in the Sanctions Screening Tool. The screening result is attached to the application as an audit record. A sanctions hit suspends the application pending Compliance investigation.

## Risk addressed
Without this control, the bank could issue a guarantee in favour of a sanctioned party or into a sanctioned jurisdiction, creating regulatory breaches, financial penalties and reputational damage.

## Timing
The control runs at step 4 — Sanctions and Compliance Screening — for every application, prior to issuance approval.

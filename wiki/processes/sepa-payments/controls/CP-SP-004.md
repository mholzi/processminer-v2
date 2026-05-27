---
id: CP-SP-004
type: control
section: controls
title: Sanctions and AML screening control
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
controlType: PREVENTIVE
execution: AUTOMATED
effectiveness: HIGH
owner: Compliance
step: [PS-SP-004]
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:00Z
---
## What it checks
Screens the debtor and creditor against sanctions lists and runs the payment through AML transaction monitoring.

## Control activity
The Sanctions Screening Engine and AML Transaction Monitoring system check each payment automatically. Clean items pass without intervention. Potential hits are routed to Compliance for manual review; confirmed hits cause the payment to be frozen and escalated to Compliance and Financial Crime.

## Risk addressed
Processing payments to or from sanctioned parties or in connection with money laundering, exposing the bank to regulatory enforcement, fines, and reputational damage.

## Timing
Runs on every item after funds earmarking and before fraud scoring.

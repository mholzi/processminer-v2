---
id: CP-SPP-008
type: control
section: controls
title: SCT Inst SLA monitoring (10-second rule)
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
controlType: DETECTIVE
execution: AUTOMATED
owner: Payments Operations
step: [PS-SPP-009]
provenance: {"Control activity": {"evidence": "SCT Inst SLA monitoring (10-second rule) | Detective / automated | Continuous", "source": "document"}, "Risk addressed": {"evidence": "", "source": "proposed"}, "Timing": {"evidence": "SCT Inst SLA monitoring (10-second rule) | Detective / automated | Continuous", "source": "document"}, "What it checks": {"evidence": "SCT Inst SLA monitoring (10-second rule)", "source": "document"}}
---
## What it checks
Whether SCT Inst payments meet the 10-second end-to-end settlement and confirmation rule.

## Control activity
The 10-second SCT Inst service level is monitored continuously and automatically across instant payments.

## Risk addressed
Without it, breaches of the SCT Inst 10-second scheme rule could go undetected.

## Timing
Runs automatically and continuously over SCT Inst payments.

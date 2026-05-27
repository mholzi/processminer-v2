---
id: CP-SP-008
type: control
section: controls
title: SCT Inst SLA monitoring
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
controlType: DETECTIVE
execution: AUTOMATED
effectiveness: HIGH
owner: Payment Operations
step: [PS-SP-009]
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:00Z
---
## What it checks
Tracks whether each SCT Inst submission receives a settlement confirmation from the beneficiary bank within the 10-second scheme deadline, detecting timeouts and rejections that require fallback or exception handling.

## Control activity
The Payment Hub monitors the response time for every SCT Inst submission continuously. If no positive confirmation is received within 10 seconds, the system triggers an automatic fallback to standard SCT where eligible or routes the item to the exception-handling path for return to the customer.

## Risk addressed
Undetected SCT Inst timeouts leaving the payment in an uncertain state, risking double-settlement, delayed customer notification, or SLA breach under SEPA Instant scheme rules.

## Timing
Continuous — monitored in real time for every SCT Inst submission from the moment the pacs.008 is sent until confirmation or timeout.

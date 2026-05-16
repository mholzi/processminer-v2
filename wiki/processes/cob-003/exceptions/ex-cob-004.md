---
id: EX-COB-004
type: exception
section: exceptions
title: System Downtime
status: confirmed
confidence: high
source: DTP-BB-ONB-001 v2.3
category: System
frequencyPct: 1
impact: HIGH
handlingOwner: IT Service Desk
affects: [PS-COB-004]
---
## Description
Triggered when the core banking system is unavailable for more than four hours during account setup. Rare — about 1% of applications.

## Handling
The IT Service Desk owns recovery; affected cases are queued and processed once the system is restored.

## Impact
High while it lasts — account setup stops entirely for every in-flight case.

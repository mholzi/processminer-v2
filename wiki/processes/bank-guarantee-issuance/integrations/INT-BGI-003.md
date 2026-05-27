---
id: INT-BGI-003
type: integration
section: integrations
title: Trade Finance System to SWIFT
status: draft
confidence: high
systems: [SYS-BGI-002, SYS-BGI-004]
---
## What connects
Trade Finance System (SYS-BGI-002) to SWIFT (SYS-BGI-004) — manual-trigger transmission of executed guarantee instruments.

## What flows
- MT 760 guarantee instrument message, triggered manually by the TFO from the Trade Finance System to the beneficiary's bank on issuance approval
- MT 768 acknowledgement received from the beneficiary's bank, confirming receipt and completing step 6

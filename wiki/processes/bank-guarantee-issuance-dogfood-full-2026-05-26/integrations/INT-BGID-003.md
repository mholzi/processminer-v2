---
id: INT-BGID-003
type: integration
section: integrations
title: Trade Finance System to SWIFT Gateway — Guarantee Issuance and Status
status: draft
confidence: medium
source: it-architect session 2026-05-26
systems: [SYS-BGID-002, SYS-BGID-004]
provenance: {"What connects": {"evidence": "Elicited: SWIFT Alliance Access, async, 3-retry then ops alert, confidential, PS-BGID-006", "source": "elicited"}, "What flows": {"evidence": "Elicited: MT760 guarantee instrument, MT799 status message, ACK/NAK", "source": "elicited"}}
updatedBy: admin
updatedAt: 2026-05-26T10:09:43Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## What connects
Async message integration from the Trade Finance System (SYS-BGID-002) to the SWIFT gateway (SYS-BGID-004) at PS-BGID-006. Protocol: SWIFT Alliance Access; retry: 3 attempts then ops alert; classification: confidential.

## What flows
- MT760 guarantee instrument transmitted to the beneficiary bank via SWIFT
- MT799 free-format message for pre-advice and amendments
- SWIFT ACK/NAK delivery confirmation returned to TFS; NAK triggers operational alert

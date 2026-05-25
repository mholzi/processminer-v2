---
id: SYS-BGI-004
type: system
section: systems
title: SWIFT
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
systemType: EXTERNAL
provenance: {"Purpose": {"evidence": "SWIFT — transmission of the executed guarantee to the beneficiary's bank.", "source": "document"}, "Role in this process": {"evidence": "MT 760 for guarantee issuance. TFO triggers transmission manually from within the TFS. MT 768 acknowledgement received from beneficiary's bank; step 6 is fully complete only on receipt of that acknowledgement, not at message send.", "source": "elicited"}}
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-19
---
## Purpose
Transmission of the executed guarantee to the beneficiary's bank.

## Role in this process
Used at step 6 to transmit the executed guarantee via MT 760; the TFO triggers transmission manually from the Trade Finance System (INT-BGI-003). Step 6 completes on receipt of the beneficiary bank's MT 768 acknowledgement, not at message send.

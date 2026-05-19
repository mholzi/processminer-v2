---
id: SYS-SPP-002
type: system
section: systems
title: Payment Hub
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
systemType: CORE
provenance: {"Purpose": {"evidence": "Payment Hub | Validation, routing, orchestration, message generation", "source": "document"}, "Role in this process": {"evidence": "Payment Hub | Validation, routing, orchestration, message generation", "source": "document"}}
---
## Purpose
The central engine that handles payment validation, routing, orchestration and message generation.

## Role in this process
Validates instructions, checks funds, decides the rail, orchestrates screening, generates the pacs.008 message and submits it to the CSM.

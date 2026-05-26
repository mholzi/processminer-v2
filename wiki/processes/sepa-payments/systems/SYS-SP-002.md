---
id: SYS-SP-002
type: system
section: systems
title: Payment Hub
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
provenance: {"Purpose": {"evidence": "§8 Systems & Data table: 'Payment Hub | Validation, routing, orchestration, message generation'", "source": "document"}, "Role in this process": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:09:11Z
systemType: CORE
---
## Purpose
Central orchestration engine for SEPA payment processing — performs validation, routing, message generation, and settlement coordination.

## Role in this process
Drives the payment lifecycle: validates instructions, detects duplicates, triggers funds checks against Core Banking, orchestrates screening, makes the SCT/SCT Inst routing decision, generates pacs.008, and submits to the CSM Gateway.

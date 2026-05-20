---
id: PS-DCR-003
type: process-step
section: process-steps
title: Block the existing card
status: draft
confidence: high
source: dcr-dtp-mockup.md
owner: Contact Centre Agent
systems: [SYS-DCR-001]
transitions: [PS-DCR-004|branch|card reported lost or stolen, PS-DCR-005|branch|card reported damaged]
provenance: {"Inputs": {"evidence": "the agent places an immediate block on the existing card", "source": "document"}, "Outputs": {"evidence": "Card lost or stolen? | Fraud exposure check | Skip to card order", "source": "document"}, "What happens": {"evidence": "The agent places an immediate block on the existing card in the Card Management System so it can no longer be used. For lost or stolen cards the block is permanent; for damaged cards the block is also applied because the card number is reissued.", "source": "document"}, "Why it matters": {"evidence": "S. Krause confirmed in the foundational run: Why it matters holds as drafted.", "source": "elicited"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-19
---
## What happens
The agent places an immediate block on the existing card in the Card Management System so it can no longer be used. For lost or stolen cards the block is permanent. For damaged cards a block is also applied, because the replacement carries a new card number and the old number is retired.

## Inputs
- The verified replacement request
- The existing card number
- The reported reason: lost, stolen, or damaged

## Outputs
- The existing card blocked in the Card Management System
- A request routed by reason — to the fraud check or directly to the card order

## Why it matters
Blocking the card immediately limits the window in which a lost or stolen card can be used fraudulently, which is the most time-sensitive action in the process.

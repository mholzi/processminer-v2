---
id: CP-DCR-002
type: control
section: controls
title: Immediate card block on lost or stolen report
status: draft
confidence: high
source: dcr-dtp-mockup.md
controlType: PREVENTIVE
execution: MANUAL
owner: Contact Centre
step: [PS-DCR-003]
provenance: {"Control activity": {"evidence": "The agent places an immediate block on the existing card in the Card Management System", "source": "document"}, "Risk addressed": {"evidence": "S. Krause confirmed in the foundational run: Risk addressed holds as drafted.", "source": "elicited"}, "Timing": {"evidence": "Card block applied | Immediately during the request", "source": "document"}, "What it checks": {"evidence": "Immediate card block on lost/stolen report | Preventive / automated | Every lost/stolen request", "source": "document"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-19
regulatedBy: [REG-DCR-001]
---
## What it checks
Ensures a card reported lost or stolen is rendered unusable without delay.

## Control activity
An immediate block is applied to the card in the Card Management System as soon as the loss or theft is reported and identity is verified.

## Risk addressed
Without it, a lost or stolen card would remain usable, exposing the customer and the bank to fraudulent transactions.

## Timing
Applied immediately during every lost or stolen card request.

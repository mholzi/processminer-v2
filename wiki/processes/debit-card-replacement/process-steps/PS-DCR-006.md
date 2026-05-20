---
id: PS-DCR-006
type: process-step
section: process-steps
title: Confirm dispatch
status: draft
confidence: high
source: dcr-dtp-mockup.md
owner: Contact Centre Agent
sla: Card delivered within 4-6 business days of the order
systems: [SYS-DCR-004]
provenance: {"Inputs": {"evidence": "dispatched to the customer's registered address", "source": "document"}, "Outputs": {"evidence": "The replacement card is produced by the card bureau and dispatched to the customer's registered address.", "source": "document"}, "What happens": {"evidence": "The replacement card is produced by the card bureau and dispatched to the customer's registered address. The customer is told the expected delivery time (5-7 business days) and that the card must be activated on first use.", "source": "document"}, "Why it matters": {"evidence": "S. Krause confirmed in the foundational run: Why it matters holds as drafted.", "source": "elicited"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-19
---
## What happens
The replacement card is produced by the external card bureau and dispatched to the customer's registered address. The customer is told the expected delivery time of five to seven business days and that the new card must be activated on first use — given on the call for phone requests, or by an in-app notification for requests raised in the mobile app.

## Inputs
- A released replacement card order
- The customer's registered address
- The expected delivery timeframe

## Outputs
- A replacement card produced and posted to the customer
- A dispatch confirmation given to the customer

## Why it matters
Confirming dispatch and the activation requirement sets the customer's expectations and closes the process with the customer knowing when their card will arrive.

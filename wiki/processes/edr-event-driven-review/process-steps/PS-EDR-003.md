---
id: PS-EDR-003
type: process-step
section: process-steps
title: Request updated information
status: draft
confidence: high
source: event-driven-review.md
owner: Relationship Manager
condition: CDD refresh required
transitions: [PS-EDR-004|normal|customer provides updated documentation, EX-EDR-001|exception|customer unresponsive after two chasers]
systems: [SYS-EDR-004]
provenance: {"Inputs": {"evidence": "Key inputs: trigger event, current risk rating, prior KYC pack, transaction history.", "source": "document"}, "Outputs": {"evidence": "contacts the customer to gather updated KYC documentation: identity, address, beneficial ownership, source of funds / source of wealth, expected activity.", "source": "document"}, "What happens": {"evidence": "the Analyst notifies the Relationship Manager, who contacts the customer to gather updated KYC documentation: identity, address, beneficial ownership, source of funds / source of wealth, expected activity.", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
---
## What happens
The Analyst notifies the Relationship Manager, who contacts the customer to gather updated KYC documentation: identity, address, beneficial ownership, source of funds, source of wealth, and expected activity.

## Inputs
- CDD refresh decision
- Prior KYC pack

## Outputs
- Updated KYC documentation received from customer
- Refreshed data on identity, address, beneficial ownership, source of funds/wealth, and expected activity

## Why it matters
Ensures the KYC pack reflects the customer's current circumstances, forming the basis for accurate risk re-assessment.

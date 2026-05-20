---
id: PS-DCR-005
type: process-step
section: process-steps
title: Order replacement card
status: draft
confidence: high
source: dcr-dtp-mockup.md
owner: Card Operations Clerk
systems: [SYS-DCR-001, SYS-DCR-004]
transitions: [PS-DCR-006|normal|replacement card ordered, EX-DCR-003|exception|registered address unconfirmed]
provenance: {"Inputs": {"evidence": "orders a like-for-like replacement card", "source": "document"}, "Outputs": {"evidence": "A like-for-like replacement card of the same product and type as the original", "source": "document"}, "What happens": {"evidence": "The Card Operations Clerk orders a like-for-like replacement card. The new card carries a new card number; the PIN is unchanged and is not reissued.", "source": "document"}, "Why it matters": {"evidence": "S. Krause confirmed in the foundational run: Why it matters holds as drafted.", "source": "elicited"}}
approval: approved
approvalBy: S. Krause
approvalDate: 2026-05-19
---
## What happens
The Card Operations Clerk orders a like-for-like replacement card in the Card Management System. The new card carries a new card number; the customer's PIN is unchanged and is not reissued. The order is then released to the card bureau for production.

## Inputs
- A blocked card with a clear fraud assessment, or a damaged-card request
- The customer's card product and type
- The customer's registered address

## Outputs
- A replacement card order carrying a new card number
- A production and dispatch instruction sent to the card bureau

## Why it matters
This step produces the actual replacement; ordering a like-for-like card with the existing PIN keeps the customer's experience unchanged while retiring the compromised card number.

---
id: EX-BGID-001
type: exception
section: exceptions
title: Insufficient Facility Limit
status: draft
confidence: medium
source: bank-guarantee-issuance-v1.md
category: credit
impact: HIGH
frequencyPct:
handlingOwner: Credit Team
updatedBy: the assistant
updatedAt: 2026-05-26T05:18:45Z
---
## Description
The client's approved guarantee facility does not hold sufficient available limit to cover the requested guarantee amount. This exception arises at the Credit and Facility Check step when the Trade Finance Officer identifies that the existing facility cannot accommodate the new guarantee.

## Handling
The application is parked and routed to the Credit team. This is the most common reason for delay in the process.

## Impact
Processing stalls until the Credit team resolves the facility shortfall, delaying guarantee issuance and potentially affecting the client's underlying commercial transaction.

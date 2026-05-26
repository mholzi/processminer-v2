---
id: PS-BGID-002
type: process-step
section: process-steps
title: Credit and Facility Check
status: draft
confidence: medium
source: bank-guarantee-issuance-v1.md
owner: Trade Finance Officer
systems: [SYS-BGID-002]
transitions: [PS-BGID-003|normal|facility limit is sufficient and credit check passes, EX-BGID-001|exception|facility limit is insufficient]
provenance: {"Inputs": {"evidence": "", "source": "proposed"}, "Outputs": {"evidence": "", "source": "proposed"}, "What happens": {"evidence": "The Trade Finance Officer confirms the client holds an approved guarantee facility with sufficient available limit. If the limit is insufficient, the application is parked and routed to the Credit team — this is the most common reason for delay.", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:56:10Z
---
## What happens
The Trade Finance Officer confirms that the client holds an approved guarantee facility with sufficient available limit to cover the requested guarantee amount. If the limit is insufficient, the application is parked and routed to the Credit team to arrange a limit increase. This is the most common reason for delay in the process.

## Inputs
- Validated application record from intake
- Requested guarantee amount and currency

## Outputs
- Confirmed facility availability
- Application routed to wording review (if limit sufficient) or parked pending Credit team action (if insufficient)

## Why it matters
The facility check ensures the bank does not commit a guarantee beyond the client's approved credit limit.

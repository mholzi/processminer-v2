---
id: EX-BGID-001
type: exception
section: exceptions
title: Insufficient Facility Limit
status: draft
confidence: medium
source: bank-guarantee-issuance-v1.md
category: credit/facility
impact: HIGH
handlingOwner: Credit Team
provenance: {"Description": {"evidence": "If the limit is insufficient, the application is parked and routed to the Credit team — this is the most common reason for delay.", "source": "document"}, "Handling": {"evidence": "", "source": "proposed"}, "Impact": {"evidence": "Applications frequently stall at the credit and facility check when the client has not pre-arranged enough limit. / The target turnaround is 3 business days from a complete application to guarantee delivery, measured for standard-wording guarantees with no screening hit.", "source": "document"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:56:10Z
---
## Description
Occurs at the credit and facility check step when the client's approved guarantee facility has insufficient available limit to cover the requested guarantee amount. The document identifies this as the most common reason for delay in the issuance process.

## Handling
The application is parked and routed to the Credit Team.

## Impact
Causes the application to stall, extending turnaround beyond the 3-business-day standard service level target.

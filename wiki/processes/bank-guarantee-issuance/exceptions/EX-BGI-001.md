---
id: EX-BGI-001
type: exception
section: exceptions
title: Insufficient Facility Limit
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
category: credit
impact: HIGH
handlingOwner: Credit team
provenance: {"Description": {"evidence": "The Trade Finance Officer confirms the client holds an approved guarantee facility with sufficient available limit. If the limit is insufficient, the application is parked and routed to the Credit team.", "source": "document"}, "Handling": {"evidence": "TFO routes to Credit directly; TFM informed for awareness but not in path. Credit can approve temporary limit increase, permanent facility amendment, or decline. On resolution TFO manually re-queues. On decline application is closed; client notified via RM who works with client on smaller amount or facility increase before resubmission.", "source": "elicited"}, "Impact": {"evidence": "this is the most common reason for delay. Applications frequently stall at the credit and facility check when the client has not pre-arranged enough limit.", "source": "document"}}
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-19
---
## Description
The client's approved guarantee facility does not have sufficient available limit to cover the requested guarantee amount at the time of application.

## Handling
The TFO parks and routes the application to Credit directly (TFM informed, not in path). Credit can approve a temporary limit increase, a permanent facility amendment, or decline. On resolution the TFO manually re-queues. On decline, the application is closed; the client is notified via the relationship manager to arrange a facility increase or resubmit with a smaller amount.

## Impact
Described as the most common reason for delay in the process; applications frequently stall at the credit and facility check when the client has not pre-arranged enough limit.

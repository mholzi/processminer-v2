---
id: EX-EDR-001
type: exception
section: exceptions
title: Customer unresponsive to KYC refresh request
status: draft
confidence: medium
source: event-driven-review.md
category: customer-responsiveness
impact: HIGH
handlingOwner: Financial Crime Officer (2LoD)
provenance: {"Description": {"evidence": "Step 3: 'If the customer is unresponsive after two chasers → see Exception E-1.'", "source": "document"}, "Handling": {"evidence": "E-1: 'Case escalates to the Financial Crime Officer after the second chaser. The Officer decides between forced restriction (limit outgoing transactions) and exit recommendation. The case SLA pauses while the decision is pending.'", "source": "document"}, "Impact": {"evidence": "The case SLA pauses while the decision is pending.", "source": "document"}}
---
## Description
The customer fails to respond to two chasers requesting updated KYC documentation during the CDD refresh stage.

## Handling
The case is escalated to the Financial Crime Officer after the second chaser. The Officer decides between imposing a forced restriction (limiting outgoing transactions) and recommending exit. The case SLA is paused while the decision is pending.

## Impact
Delays case closure and may result in account restriction or exit.

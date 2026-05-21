---
id: EX-EDR-004
type: exception
section: exceptions
title: Customer deceased or company dissolved
status: draft
confidence: medium
source: event-driven-review.md
category: customer-status
impact: HIGH
handlingOwner: Unassigned
provenance: {"Description": {"evidence": "", "source": "proposed"}, "Handling": {"evidence": "EDR pauses; case is referred to account closure (PRC-RET-0301). Section 2 out-of-scope: 'Account closure due to risk (covered by PRC-RET-0301, Corporate Account Closure).'", "source": "document"}, "Impact": {"evidence": "EDR pauses; case is referred to account closure (PRC-RET-0301).", "source": "document"}}
---
## Description
The customer is found to be deceased or the company has been dissolved.

## Handling
The EDR is paused and the case is referred to the account closure process (PRC-RET-0301, Corporate Account Closure).

## Impact
Suspends the EDR and redirects the case to the account closure process.

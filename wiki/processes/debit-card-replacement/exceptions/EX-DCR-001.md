---
id: EX-DCR-001
type: exception
section: exceptions
title: Identity verification fails
status: draft
confidence: high
source: dcr-dtp-mockup.md
impact: MEDIUM
handlingOwner: Contact Centre Agent
category: Identity verification
approval: approved
approvalBy: S. Krause
approvalDate: 2026-05-19
---
## Description
The customer cannot satisfy knowledge-based identity verification on a phone request, so the agent cannot confirm they are the genuine cardholder.

## Handling
The replacement is not processed on the call. The customer is directed to a branch with photo identification. If the customer has reported the card lost or stolen, the existing card is still blocked.

## Impact
Delays the replacement and forces a branch visit, adding effort for the customer, while still protecting against an impersonation attempt.

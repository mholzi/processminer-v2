---
id: EX-COB-003
type: exception
section: exceptions
title: Credit Decline
status: confirmed
confidence: high
source: DTP-BB-ONB-001 v2.3
category: Credit
frequencyPct: 15
impact: MEDIUM
handlingOwner: Relationship Manager
affects: [PS-COB-003]
---
## Description
Triggered when the credit assessment fails the scorecard or lending policy. It occurs on about 15% of applications that requested an overdraft.

## Handling
The Relationship Manager informs the client, who may proceed with a deposit-only account or withdraw.

## Impact
Medium — the deposit account can still open; only the requested facility is refused.

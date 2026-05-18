---
id: EX-COB-001
type: exception
section: exceptions
title: Incomplete Documentation
status: confirmed
confidence: high
source: DTP-BB-ONB-001 v2.3
category: Documentation
frequencyPct: 30
impact: MEDIUM
handlingOwner: Operations Officer
affects: [PS-COB-001, PS-COB-002]
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-18
---
## Description
Triggered when required documents are missing after submission. It is the most common exception in the process, firing on roughly 30% of applications.

## Handling
The Operations Officer identifies the missing items, contacts the client, and holds the case until the documents arrive. The case does not advance to KYC until it is complete.

## Impact
Medium — mainly cycle-time loss. It is tied directly to pain point PP-COB-001 (manual document chasing).

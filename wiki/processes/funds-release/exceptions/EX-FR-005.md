---
id: EX-FR-005
type: exception
section: exceptions
title: Release posting fails at execution
status: draft
confidence: high
source: SME interview - M. Berger
category: Execution
impact: MEDIUM
handlingOwner: Operations Analyst
---
## Description
The posting of an approved release fails at execution — either insufficient funds in the held account because Treasury-confirmed funding was consumed by another release (see PP-FR-001), or a rejection returned by the core banking system.

## Handling
The Operations Analyst receives a posting-failure alert and reworks the item manually — re-attempting the posting or re-routing it for funding confirmation. The failure is handled informally; nothing is logged as a formal exception today.

## Impact
Delays the release until the posting succeeds. Because the failure is not logged as an exception, there is no exception record and no measurable resolution time.

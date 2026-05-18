---
id: PG-FR-006
type: process-gap
section: process-gaps
title: Suspended/under-review facility bounce not logged as an exception
status: draft
confidence: high
source: SME interview - M. Berger
area: Validation
gapStatus: open
affects: [PS-FR-002]
---
## The gap
When a release fails validation because its facility is suspended or under review, the item is informally bounced to the front office to clarify with Credit, with no exception logged — unlike expired or in-default facilities, which raise EX-FR-001.

## Impact
These bounced items leave no exception record, so they are invisible to exception metrics and audit, and the volume and resolution time of suspended-facility releases cannot be measured.

## Next step
Decide whether a suspended or under-review facility should raise a logged exception, and if so define its handling, owner and routing.

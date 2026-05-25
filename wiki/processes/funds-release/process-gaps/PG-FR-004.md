---
id: PG-FR-004
type: process-gap
section: process-gaps
title: No consistent rule for non-business-day value dates
status: draft
confidence: high
source: funds-release-dtp-mockup.md
area: Value dating
gapStatus: open
affects: [PS-FR-002]
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-18
---
## The gap
There is no consistent rule for a value date falling on a weekend or public holiday. The PS-FR-002 business-day check only flags the date; the analyst then decides ad hoc whether to roll it to the next business day or return the item.

## Impact
Ad hoc, per-analyst handling produces inconsistent value dating and rescheduling of affected releases, with no auditable basis for whether a date was rolled or the item returned.

## Next step
Define a consistent rule for rolling versus returning non-business-day value dates. The rule must be currency-calendar-aware, since a date can be a holiday in one currency's calendar but not another, and ties to PG-FR-011.

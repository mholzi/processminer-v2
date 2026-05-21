---
id: PG-EDR-003
type: process-gap
section: process-gaps
title: SLA applicability for non-business-day triggers unclear
status: draft
confidence: high
source: event-driven-review.md
area: As-Is process
gapStatus: open
provenance: {"Impact": {"evidence": "", "source": "proposed"}, "Next step": {"evidence": "", "source": "proposed"}, "The gap": {"evidence": "Can the 2-business-day open SLA be met for non-business-day triggers (weekend alerts)? (Section 10 Open Questions)", "source": "document"}}
---
## The gap
It is not defined whether the 2-business-day case-opening SLA can be met for triggering events raised on weekends or non-business days.

## Impact
Weekend or holiday triggers may systematically breach the opening SLA.

## Next step
Confirm with the SME how weekend and non-business-day triggers are handled and whether the SLA definition needs adjustment.

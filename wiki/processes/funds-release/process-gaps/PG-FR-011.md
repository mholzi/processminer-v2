---
id: PG-FR-011
type: process-gap
section: process-gaps
title: Per-currency same-day value cut-off table not documented
status: draft
confidence: high
source: SME interview - M. Berger
area: Value dating
gapStatus: open
affects: [M-FR-004, PS-FR-005, PS-FR-007]
---
## The gap
Only the EUR / internal-operations cut-off (14:00 CET) is documented. Other currencies have their own cut-offs tied to their settlement rails, but the per-currency cut-off table is not recorded.

## Impact
PS-FR-005 and PS-FR-007 enforce same-day value against a single 14:00 CET figure, so non-EUR releases can be value-dated wrongly — given same-day value after their currency cut-off has passed, or held back unnecessarily.

## Next step
Document the per-currency same-day value cut-off table and reference it from PS-FR-005 and PS-FR-007 instead of the single EUR figure.

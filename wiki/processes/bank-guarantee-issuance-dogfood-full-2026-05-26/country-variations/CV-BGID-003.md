---
id: CV-BGID-003
type: country-variation
section: country-variations
title: DACH 16:00 cut-off for MT760 same-day
status: draft
confidence: medium
countries: DE, AT, CH
variationType: OPERATIONAL
affects: [PS-BGID-006]
provenance: {"Description": {"evidence": "", "source": "proposed"}, "Reason": {"evidence": "", "source": "proposed"}, "Variation detail": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-26T19:43:22Z
---
## Description
In DACH markets, MT760 messages submitted after 16:00 CET miss same-day SWIFT delivery and roll to the next business day.

## Variation detail
PS-BGID-006 SWIFT delivery enforces a strict 16:00 CET cut-off for DACH-originated MT760 traffic; applications confirmed after the cut-off carry a next-day delivery commitment to the beneficiary. The Trade Finance Officer surfaces the cut-off at acceptance.

## Reason
Local clearing windows and beneficiary-bank reconciliation conventions in the DACH region require afternoon cut-off discipline that the Group-default 18:00 CET does not meet.

---
id: M-EDR-004
type: metric
section: metrics
title: Sanctions-confirmed hit handoff time
status: draft
confidence: high
source: event-driven-review.md
target: Same business day
value: Not measured
trend:
provenance: {"Current reading": {"evidence": "Sanctions-confirmed hit handed off | Same business day (Section 9 SLA table)", "source": "document"}, "Definition": {"evidence": "If a true sanctions hit is found → freeze the relationship and hand to PRC-AML-0420 (Suspicious Activity Reporting). (Section 5.1 step 4); Sanctions-confirmed hit handed off | Same business day (Section 9 SLA table)", "source": "document"}, "Why it matters": {"evidence": "If a true sanctions hit is found → freeze the relationship and hand to PRC-AML-0420 (Section 5.1 step 4)", "source": "document"}}
---
## Definition
The time from confirmation of a true sanctions hit to handoff to the Suspicious Activity Reporting process (PRC-AML-0420).

## Current reading
Target is same business day as confirmation; no measured actual is available.

## Why it matters
A confirmed sanctions hit requires immediate action to freeze the relationship.

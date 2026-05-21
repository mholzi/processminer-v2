---
id: M-EDR-001
type: metric
section: metrics
title: Case opening time
status: draft
confidence: high
source: event-driven-review.md
target: Within 2 business days of event
value: Not measured
trend:
provenance: {"Current reading": {"evidence": "Case opened after event | Within 2 business days (Section 9 SLA table)", "source": "document"}, "Definition": {"evidence": "When a triggering event is identified, the Financial Crime Analyst opens an EDR case in the case-management system. (Section 5.1 step 1); Case opened after event | Within 2 business days (Section 9 SLA table)", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
---
## Definition
The time from the triggering event to the opening of an EDR case in the case-management system.

## Current reading
Target is within 2 business days; no measured actual is available.

## Why it matters
Ensures review events are acted on promptly, so that customer due diligence is refreshed when something material happens rather than waiting for the next periodic cycle.

---
id: M-DDMM-003
type: metric
section: metrics
title: R-Transaction Resolution Time
status: draft
confidence: high
source: ddmm-dtp-mockup.md
target: Within 2 business days of identification
value: Not measured
provenance: {"Current reading": {"evidence": "R-transaction resolution | Within 2 business days of identification", "source": "document"}, "Definition": {"evidence": "SME (M. Vogel) confirmed: clock starts on automatic queue entry from Payment Hub (effectively at receipt); does not wait for manual Clerk pickup to prevent SLA gaming.", "source": "elicited"}, "Why it matters": {"evidence": "SME confirmed accurate as drafted.", "source": "elicited"}}
trend:
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## Definition
Elapsed time from the point the Payment Hub forwards an R-transaction into the Mandate Clerk's queue (automatic on receipt, not manual pickup) to completion of the resolution action.

## Current reading
No measured actual is available; the SLA target is within 2 business days of identification.

## Why it matters
Unresolved R-transactions leave mandate records in an inconsistent state and may delay or prevent future creditor collections.

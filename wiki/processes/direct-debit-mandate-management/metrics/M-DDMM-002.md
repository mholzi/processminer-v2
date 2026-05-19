---
id: M-DDMM-002
type: metric
section: metrics
title: Bulk File Processing Turnaround
status: draft
confidence: high
source: ddmm-dtp-mockup.md
target: Within 2 business days of receipt
value: Not measured
provenance: {"Current reading": {"evidence": "Bulk file processing | Within 2 business days of receipt", "source": "document"}, "Definition": {"evidence": "SME (M. Vogel) confirmed: SLA covers valid-mandate subset only; invalid mandates drop out on return, timed as fresh requests on resubmission; dual-control check is bank-side work counted within the 2-day target.", "source": "elicited"}, "Why it matters": {"evidence": "SME confirmed accurate as drafted.", "source": "elicited"}}
trend:
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## Definition
Bank-side elapsed time from bulk file receipt to registration of the valid-mandate subset; invalid mandates returned to the creditor drop out and are timed as fresh requests. Dual-control review is included in the target.

## Current reading
No measured actual is available; the SLA target is within 2 business days of receipt.

## Why it matters
Bulk uploads typically involve large volumes of mandates; delays impact the creditor's ability to launch new collection campaigns on schedule.

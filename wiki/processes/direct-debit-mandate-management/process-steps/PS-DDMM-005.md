---
id: PS-DDMM-005
type: process-step
section: process-steps
title: Register Mandate
status: draft
confidence: high
source: ddmm-dtp-mockup.md
owner: Mandate Clerk
sla:
condition:
transitions: [PS-DDMM-006|normal|registration successful, EX-DDMM-004|exception|MMS registration failure]
systems: [SYS-DDMM-002, SYS-DDMM-003]
provenance: {"Inputs": {"evidence": "Confirmed both inputs as accurate as drafted.", "source": "elicited"}, "Outputs": {"evidence": "MMS statuses in play: Active, Cancelled, Dormant. Amendment = versioned update. Payment Hub sync is intraday batch, not real-time.", "source": "elicited"}, "What happens": {"evidence": "Amendment updates existing MMS record in place but is versioned — a new version row is written and prior version retained for audit; UMR unchanged. Cancellation moves mandate to Cancelled status — never deleted from MMS. Payment Hub sync is a batch sync, intraday, not real-time. Window where MMS and Payment Hub can be out of step; CP-DDMM-004 exists precisely to catch that divergence.", "source": "elicited"}, "Why it matters": {"evidence": "Confirmed as accurate as drafted.", "source": "elicited"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-19
---
## What happens
The mandate is created, amended, or cancelled in MMS. On creation, status is set to Active. An amendment updates the existing record in place and is versioned — a new version row is written while the prior version is retained for audit; the UMR is unchanged. A cancellation moves the mandate to Cancelled status; records are never deleted from MMS. The updated data is reflected in the Payment Hub mandate store via an intraday batch sync — not real-time — so MMS and Payment Hub can briefly diverge; CP-DDMM-004 exists to detect that.

## Inputs
- Validated mandate data (and dual-control approval for bulk uploads)
- Existing MMS mandate record (amendments and cancellations)

## Outputs
- Mandate record in MMS (Active for new mandates; versioned update for amendments; Cancelled status for cancellations)
- Updated mandate store in Payment Hub (via intraday batch sync)

## Why it matters
Without a successful MMS write the mandate does not exist operationally and no SEPA collection can reference it.

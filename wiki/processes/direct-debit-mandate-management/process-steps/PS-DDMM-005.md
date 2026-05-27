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
systems: [SYS-DDMM-002, SYS-DDMM-003]
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

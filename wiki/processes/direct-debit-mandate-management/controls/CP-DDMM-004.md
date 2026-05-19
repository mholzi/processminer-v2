---
id: CP-DDMM-004
type: control
section: controls
title: Daily MMS vs Payment Hub Reconciliation
status: draft
confidence: high
source: ddmm-dtp-mockup.md
controlType: DETECTIVE
execution: MANUAL
owner: Payments Operations
provenance: {"Control activity": {"evidence": "SME (M. Vogel) confirmed: comparison is tool-assisted (system-generated reconciliation report); review and discrepancy resolution are manual. Standard resolution: re-trigger MMS-to-Payment-Hub sync; IT ticket on failure. Resolution procedure documented in ops procedures (not DTP).", "source": "elicited"}, "Risk addressed": {"evidence": "SME confirmed accurate as drafted.", "source": "elicited"}, "Timing": {"evidence": "C-4 | Frequency: Daily", "source": "document"}, "What it checks": {"evidence": "C-4 | Daily reconciliation of MMS vs payment hub mandate store | Detective / manual | Daily", "source": "document"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-19
regulatedBy: [REG-DDMM-001, REG-DDMM-005, REG-DDMM-006]
---
## What it checks
That the mandate records held in the Mandate Management System match those in the Payment Hub mandate store used for SEPA collections.

## Control activity
Payments Operations reviews a system-generated reconciliation report that compares MMS against the Payment Hub mandate store, then manually investigates and resolves each discrepancy. Resolution follows a standard procedure: re-trigger the MMS-to-Payment-Hub sync for the affected mandate; raise an IT ticket if that fails.

## Risk addressed
Unsynchronised mandate data between MMS and Payment Hub leading to failed or erroneous SEPA collections referencing mandates that do not exist or have been cancelled.

## Timing
Performed daily, outside the main mandate registration flow.

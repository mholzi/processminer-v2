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

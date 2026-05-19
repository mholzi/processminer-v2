---
id: PS-DDMM-004
type: process-step
section: process-steps
title: Dual-Control Check
status: draft
confidence: high
source: ddmm-dtp-mockup.md
owner: Mandate Checker
sla:
condition: Bulk upload above 50 mandates
transitions: [PS-DDMM-005|normal|dual-control review complete, PS-DDMM-002|loopback|discrepancies found - batch returned to Mandate Clerk for correction]
systems: []
provenance: {"Inputs": {"evidence": "Checker works from a system-generated bulk validation/exception report produced by the upload. Confirmed bulk mandate file, sanctions-cleared data, and validation results as accurate.", "source": "elicited"}, "Outputs": {"evidence": "Confirmed both outputs as accurate as drafted.", "source": "elicited"}, "What happens": {"evidence": "Checker works from system-generated bulk validation/exception report. Reviews every flagged item plus a risk-based sample of the clean ones against a standard dual-control checklist. Rejection loops back to Mandate Clerk; creditor-supplied discrepancies split out via EX-DDMM-001 path. Corrected batch resubmitted for re-review.", "source": "elicited"}, "Why it matters": {"evidence": "Confirmed as accurate as drafted.", "source": "elicited"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-19
---
## What happens
For bulk mandate file uploads above 50 mandates, the Mandate Checker independently reviews the batch against a standard dual-control checklist, working from a system-generated exception report and sampling clean items on a risk basis. Single-mandate captures and bulk files of 50 or fewer skip this step. If discrepancies are found, the batch returns to the Mandate Clerk for correction; creditor-supplied discrepancies are split out and returned to the creditor via the portal (EX-DDMM-001 path), and the corrected batch is resubmitted.

## Inputs
- Bulk mandate file
- Sanctions-cleared mandate data
- Validation results from Step 2
- System-generated bulk validation and exception report

## Outputs
- Independently reviewed and approved batch cleared for registration
- Batch rejected and returned to Mandate Clerk for correction (if discrepancies found)

## Why it matters
The four-eyes principle on large batches reduces the risk of systematic errors or fraudulent mandate insertions that would be difficult to detect individually after bulk registration.

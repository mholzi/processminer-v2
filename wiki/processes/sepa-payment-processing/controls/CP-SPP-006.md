---
id: CP-SPP-006
type: control
section: controls
title: 4-eyes release of bulk payment files
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
controlType: PREVENTIVE
execution: MANUAL
owner: Payments Operations
step: [PS-SPP-008]
provenance: {"Control activity": {"evidence": "Bulk-file release approval (4-eyes) ... Payments Ops R ... Ops Approver A/R", "source": "document"}, "Risk addressed": {"evidence": "", "source": "proposed"}, "Timing": {"evidence": "4-eyes release of bulk payment files | Preventive / manual | Per file", "source": "document"}, "What it checks": {"evidence": "4-eyes release of bulk payment files", "source": "document"}}
---
## What it checks
That a bulk payment file has been independently reviewed and approved before it is released for submission.

## Control activity
An Ops Approver provides a second pair of eyes, approving each bulk payment file for release before it is submitted to clearing.

## Risk addressed
Without it, an erroneous or unauthorised bulk file could be submitted to clearing without independent challenge.

## Timing
Performed manually once per bulk payment file before submission.

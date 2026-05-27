---
id: CP-BGIT-006
type: control
section: controls
title: Four-eyes pre-SWIFT dispatch verification
status: draft
confidence: high
source: control-compliance-specialist — M. Berger, 2026-05-20
controlType: PREVENTIVE
execution: MANUAL
owner: Trade Finance Operations
step: [PS-BGIT-006]
---
## What it checks
Verifies that the generated guarantee wording, beneficiary details, amount, currency and validity period in the guarantee document match the approved application and the approval decision before SWIFT MT760 dispatch.

## Control activity
A second Trade Finance Operations analyst, not the one who generated the guarantee, performs a side-by-side comparison of the guarantee document against the application record and approval note in the Trade Finance System. Dispatch is blocked until the second analyst records their confirmation.

## Risk addressed
Prevents dispatch of a guarantee containing data-entry errors or wording that was not approved, which would create a binding instrument that does not match the bank's approval intent.

## Timing
Performed immediately before every SWIFT MT760 dispatch at PS-BGIT-006, without exception.

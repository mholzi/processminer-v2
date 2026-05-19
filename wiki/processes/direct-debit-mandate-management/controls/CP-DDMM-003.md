---
id: CP-DDMM-003
type: control
section: controls
title: Dual-Control on Bulk Mandate Uploads
status: draft
confidence: high
source: ddmm-dtp-mockup.md
controlType: PREVENTIVE
execution: MANUAL
owner: Payments Operations
step: [PS-DDMM-004]
provenance: {"Control activity": {"evidence": "SME (M. Vogel) confirmed: Checker works from system-generated exception report + risk-based clean sample + dual-control checklist; not a full re-keying.", "source": "elicited"}, "Risk addressed": {"evidence": "SME confirmed accurate as drafted.", "source": "elicited"}, "Timing": {"evidence": "SME confirmed: 50-mandate threshold is a fixed hard rule today — not risk-based. Whether it should become risk-based is captured in PG-DDMM-001.", "source": "elicited"}, "What it checks": {"evidence": "C-3 | Dual-control on bulk mandate uploads | Preventive / manual | Per bulk file. For bulk mandate file uploads (above 50 mandates), a second person (Mandate Checker) independently reviews the batch before it is registered.", "source": "document"}}
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
regulatedBy: [REG-DDMM-006]
---
## What it checks
That bulk mandate files above 50 mandates are independently reviewed by a second operator before registration, ensuring no systematic errors or unauthorised records are included.

## Control activity
The Mandate Checker reviews every flagged item from a system-generated exception report, plus a risk-based sample of the clean mandates, against a standard dual-control checklist. The check is not a full re-keying.

## Risk addressed
Systematic data entry errors or fraudulent mandate insertions in large batch files that would be difficult to detect individually after registration.

## Timing
Performed on each bulk mandate file upload that exceeds the 50-mandate threshold (a fixed hard rule today); not applied to files at or below 50 mandates.

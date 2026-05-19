---
id: CP-DDMM-005
type: control
section: controls
title: Periodic Review of Dormant Mandates
status: draft
confidence: high
source: ddmm-dtp-mockup.md
controlType: DETECTIVE
execution: MANUAL
owner: Payments Operations
provenance: {"Control activity": {"evidence": "SME (M. Vogel) confirmed: review is judgement-based with no fixed dormancy threshold — a known weakness linked to PG-DDMM-003. Creditor notified on cancellation consistent with normal cancellation handling.", "source": "elicited"}, "Risk addressed": {"evidence": "SME confirmed accurate as drafted.", "source": "elicited"}, "Timing": {"evidence": "C-5 | Frequency: Quarterly", "source": "document"}, "What it checks": {"evidence": "C-5 | Periodic review of dormant mandates | Detective / manual | Quarterly", "source": "document"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-19
regulatedBy: [REG-DDMM-004]
---
## What it checks
That mandates flagged as Dormant are still appropriate and have not been left active beyond their useful life, creating unnecessary risk exposure.

## Control activity
Payments Operations reviews all Dormant mandates, assessing longevity and creditor intent on a judgement basis — there is no fixed dormancy-period threshold today (see PG-DDMM-003). When a dormant mandate is cancelled via this review, the creditor is notified consistent with normal cancellation handling.

## Risk addressed
Accumulation of stale dormant mandate records that inflate the mandate register and may be exploited for unauthorised collections if not actively managed.

## Timing
Performed on a quarterly cycle, outside the main mandate registration flow.

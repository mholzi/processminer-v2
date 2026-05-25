---
id: CP-CAC-005
type: control
section: controls
title: Segregation of duties — 4-eyes closure approval
status: draft
confidence: high
source: account-closure-dtp-mockup.md
controlType: PREVENTIVE
execution: MANUAL
owner: Client Lifecycle Operations
step: [PS-CAC-006]
provenance: {"Control activity": {"evidence": "A separate Closure Approver independently reviews the file and authorises the closure. The approver must not be the analyst who performed steps 2-5.", "source": "document"}, "Risk addressed": {"evidence": "Auto-approve: internally coherent and conformant. — M. Berger", "source": "elicited"}, "Timing": {"evidence": "Every closure", "source": "document"}, "What it checks": {"evidence": "Segregation of duties (4-eyes closure approval) | Preventive / manual | Every closure", "source": "document"}}
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-19
regulatedBy: [REG-CAC-005]
---
## What it checks
That a separate Closure Approver, independent of the analyst who prepared the file, authorises every closure before execution.

## Control activity
The Closure Approver independently reviews the closure file and authorises the closure. The approver must not be the same person as the analyst who performed steps 2 through 5.

## Risk addressed
A single individual authorising their own work, enabling errors or misconduct to pass undetected.

## Timing
Applied at every closure, in step 6, before execution in the Core Banking System.

---
id: PS-CAC-006
type: process-step
section: process-steps
title: Closure approval
status: draft
confidence: high
source: account-closure-dtp-mockup.md
owner: Closure Approver
systems: [SYS-CAC-001]
transitions: [PS-CAC-007|normal|closure approved]
provenance: {"Inputs": {"evidence": "Auto-approve: internally coherent and conformant. — M. Berger", "source": "elicited"}, "Outputs": {"evidence": "Auto-approve: internally coherent and conformant. — M. Berger", "source": "elicited"}, "What happens": {"evidence": "A separate Closure Approver independently reviews the file and authorises the closure. The approver must not be the analyst who performed steps 2-5.", "source": "document"}, "Why it matters": {"evidence": "Auto-approve: internally coherent and conformant. — M. Berger", "source": "elicited"}}
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-19
---
## What happens
A separate Closure Approver independently reviews the complete closure file and authorises the closure. The approver must not be the same person as the analyst who performed steps 2 through 5.

## Inputs
- Completed closure file from steps 2 through 5
- Disbursement confirmation or suspense notation

## Outputs
- Signed-off closure authorisation recorded in the workflow tool
- Case cleared for execution

## Why it matters
The 4-eyes check ensures no single individual can prepare and approve their own closure, providing a control against error or misconduct.

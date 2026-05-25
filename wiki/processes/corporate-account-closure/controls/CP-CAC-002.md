---
id: CP-CAC-002
type: control
section: controls
title: Outstanding obligations and accounting clearance
status: draft
confidence: high
source: account-closure-dtp-mockup.md
controlType: PREVENTIVE
execution: MANUAL
owner: Client Lifecycle Operations
step: [PS-CAC-003]
provenance: {"Control activity": {"evidence": "The analyst checks for unsettled items: pending payments, uncleared cheques, fees due, and linked products with a balance. Finance confirms there are no open accounting items.", "source": "document"}, "Risk addressed": {"evidence": "Auto-approve: internally coherent and conformant. — M. Berger", "source": "elicited"}, "Timing": {"evidence": "Every closure", "source": "document"}, "What it checks": {"evidence": "Outstanding obligations & accounting clearance | Preventive / manual | Every closure", "source": "document"}}
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-19
---
## What it checks
That all pending payments, uncleared cheques, fees and in-scope linked product balances (overdrafts, time deposits, sub-accounts) are settled before the account is closed.

## Control activity
The Closure Analyst checks the Core Banking System for all unsettled items and Finance confirms no open accounting items via the General Ledger, delivering confirmation through a workflow task in the Client Lifecycle Workflow Tool.

## Risk addressed
Closing an account with unresolved financial obligations, creating residual liability for the bank or the client.

## Timing
Performed at every closure, in step 3, before the compliance and sanctions check.

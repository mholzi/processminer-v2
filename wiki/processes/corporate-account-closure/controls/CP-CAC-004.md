---
id: CP-CAC-004
type: control
section: controls
title: Callback confirmation for large disbursements
status: draft
confidence: high
source: account-closure-dtp-mockup.md
controlType: PREVENTIVE
execution: MANUAL
owner: Client Lifecycle Operations
step: [PS-CAC-005]
provenance: {"Control activity": {"evidence": "", "source": "proposed"}, "Risk addressed": {"evidence": "Auto-approve: internally coherent and conformant. — M. Berger", "source": "elicited"}, "Timing": {"evidence": "", "source": "proposed"}, "What it checks": {"evidence": "Callback confirmation for large disbursements | Preventive / manual | Per threshold", "source": "document"}}
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-19
---
## What it checks
That the destination account for a large residual balance disbursement is confirmed directly with the client before the payment is executed.

## Control activity
For disbursements at or above EUR 100,000 equivalent, a callback is made to the client to confirm the nominated destination account before the payment is sent.

## Risk addressed
Fraudulent redirection of large disbursements to an account the client has not authorised.

## Timing
Applied per threshold in step 5 — triggered when a residual balance disbursement is at or above EUR 100,000 equivalent.

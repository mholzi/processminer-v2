---
id: CP-CAC-001
type: control
section: controls
title: Mandate and signatory authority verification
status: draft
confidence: high
source: account-closure-dtp-mockup.md
controlType: PREVENTIVE
execution: MANUAL
owner: Client Lifecycle Operations
step: [PS-CAC-002]
provenance: {"Control activity": {"evidence": "The Closure Analyst confirms the request comes from an authorised signatory by checking the account mandate.", "source": "document"}, "Risk addressed": {"evidence": "Auto-approve: internally coherent and conformant. — M. Berger", "source": "elicited"}, "Timing": {"evidence": "Every closure", "source": "document"}, "What it checks": {"evidence": "Mandate / signatory authority verification | Preventive / manual | Every closure", "source": "document"}}
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-19
---
## What it checks
That the closure request originates from an authorised signatory of the account, as verified against the account mandate in the Core Banking System.

## Control activity
The Closure Analyst checks the account mandate in the Core Banking System to confirm the identity and authority of the signatory before any further processing.

## Risk addressed
An unauthorised or fraudulent closure instruction being actioned, resulting in account closure without proper client consent.

## Timing
Performed at every closure, in step 2, before the obligations check proceeds.

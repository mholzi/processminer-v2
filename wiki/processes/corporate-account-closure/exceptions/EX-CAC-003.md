---
id: EX-CAC-003
type: exception
section: exceptions
title: Open compliance case or sanctions hit
status: draft
confidence: high
source: account-closure-dtp-mockup.md
category: Compliance
impact: HIGH
handlingOwner: Compliance
provenance: {"Description": {"evidence": "Financial Crime and Compliance are the same function — it's called Compliance. — Markus, 2026-05-19", "source": "elicited"}, "Handling": {"evidence": "Financial Crime and Compliance are the same function — it's called Compliance. — Markus, 2026-05-19", "source": "elicited"}, "Impact": {"evidence": "closure cannot proceed until the case is closed", "source": "document"}}
approval: approved
approvalBy: Markus
approvalDate: 2026-05-19
---
## Description
The combined compliance and sanctions screen at step 4 returns a blocking result: either a live sanctions hit against the client or account, or an existing open internal compliance case.

## Handling
Closure is fully blocked. Both a live sanctions hit and an open internal compliance case are handled by Compliance. Closure cannot proceed until Compliance formally closes the case.

## Impact
Closure is fully blocked; the timeline is indeterminate until Compliance resolves the case.

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
handlingOwner: Financial Crime
provenance: {"Description": {"evidence": "Closure Analyst triggers automated screen; Compliance adjudicates. Sanctions hit routes directly to Financial Crime; internal compliance case stays with Compliance. — M. Berger", "source": "elicited"}, "Handling": {"evidence": "Closure Analyst triggers automated screen; Compliance adjudicates. Sanctions hit routes directly to Financial Crime; internal compliance case stays with Compliance. — M. Berger", "source": "elicited"}, "Impact": {"evidence": "closure cannot proceed until the case is closed", "source": "document"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-19
---
## Description
The combined compliance and sanctions screen at step 4 returns a blocking result: either a live sanctions hit against the client or account, or an existing open internal compliance case.

## Handling
Closure is fully blocked. A live sanctions hit routes the case directly to Financial Crime for resolution. An existing internal compliance case routes to the Compliance function. Closure cannot proceed until the respective function formally closes the case.

## Impact
Closure is fully blocked; the timeline is indeterminate until Financial Crime or Compliance resolves the case.

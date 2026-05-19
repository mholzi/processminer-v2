---
id: EX-CAC-001
type: exception
section: exceptions
title: Signatory authority not confirmed
status: draft
confidence: high
source: account-closure-dtp-mockup.md
category: Authorization
impact: MEDIUM
handlingOwner: Relationship Manager
provenance: {"Description": {"evidence": "Signatory authority not confirmed | Request returned to Relationship Manager; correct authorisation requested from the client. SLA clock pauses.", "source": "document"}, "Handling": {"evidence": "Request returned to Relationship Manager; correct authorisation requested from the client. SLA clock pauses.", "source": "document"}, "Impact": {"evidence": "SLA clock pauses.", "source": "document"}}
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-19
---
## Description
The closure request cannot proceed because the signatory authority of the requesting party cannot be confirmed against the account mandate.

## Handling
The request is returned to the Relationship Manager, who requests correct authorisation from the client. The SLA clock pauses until the issue is resolved.

## Impact
Closure is delayed and the SLA clock is paused pending receipt of valid authorisation.

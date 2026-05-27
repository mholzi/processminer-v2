---
id: EX-DDMM-004
type: exception
section: exceptions
title: MMS Registration Failure
status: draft
confidence: high
source: ddmm-dtp-mockup.md
category: Technical
impact: MEDIUM
handlingOwner: Payments Ops Lead
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## Description
A technical failure in the Mandate Management System prevents the mandate from being written, despite the request passing all validation and compliance checks.

## Handling
The item is parked and escalated to the Payments Ops Lead and IT support. The registration is retried after the technical issue is resolved. If the failure is not resolved within the 1-business-day registration SLA, the Payments Ops Lead escalates to IT incident management and proactively notifies the affected creditor(s) of a processing delay.

## Impact
Registration is delayed until the system issue is fixed and the item retried. The portal shows the request as 'pending' with no technical detail. Creditors are proactively notified only if the failure puts the registration SLA at risk.

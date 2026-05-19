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
provenance: {"Description": {"evidence": "If Registration successful in MMS? → No: Exception E-4. E-4 | MMS registration failure (technical).", "source": "document"}, "Handling": {"evidence": "SME (M. Vogel) confirmed: escalation trigger = unresolved within 1-business-day registration SLA (M-DDMM-001) → escalate to IT incident management and notify affected creditors.", "source": "elicited"}, "Impact": {"evidence": "SME confirmed: portal shows 'pending/in progress' with no technical detail exposed; creditor notified proactively only if SLA at risk (unlike EX-DDMM-002 where motive is tipping-off).", "source": "elicited"}}
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

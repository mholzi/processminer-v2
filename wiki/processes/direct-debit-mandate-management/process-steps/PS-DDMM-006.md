---
id: PS-DDMM-006
type: process-step
section: process-steps
title: Confirm to Creditor
status: draft
confidence: high
source: ddmm-dtp-mockup.md
owner: Creditor Portal
sla:
condition:
transitions: []
systems: [SYS-DDMM-001]
provenance: {"Inputs": {"evidence": "Confirmed both inputs as accurate as drafted.", "source": "elicited"}, "Outputs": {"evidence": "A confirmation is returned to the creditor via the portal, including the registered UMR and effective date.", "source": "document"}, "What happens": {"evidence": "Confirmation is sent automatically by the system — once MMS confirms the registration write, the Creditor Portal generates and sends the confirmation. Mandate Clerk does not manually trigger it. New mandate: UMR + effective date. Amendment: UMR + field(s) changed + change effective date. Cancellation: UMR + cancellation effective date.", "source": "elicited"}, "Why it matters": {"evidence": "Confirmed as accurate as drafted.", "source": "elicited"}}
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## What happens
Once MMS confirms the registration write, the Creditor Portal automatically generates and sends a confirmation message to the creditor — the Mandate Clerk does not manually trigger it. The confirmation content varies by request type. A new mandate confirmation carries the registered UMR and effective date. An amendment confirmation carries the UMR, the field(s) changed, and the change effective date. A cancellation confirmation carries the UMR and the cancellation effective date.

## Inputs
- Registered mandate record (UMR, effective date)
- Creditor Portal messaging capability

## Outputs
- Creditor confirmation message sent via portal
- Registered UMR and effective date delivered to creditor

## Why it matters
Confirmation closes the loop with the creditor and provides the mandate reference data needed to initiate SEPA direct debit collections.

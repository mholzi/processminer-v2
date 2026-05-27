---
id: PS-DDMM-001
type: process-step
section: process-steps
title: Receive Request
status: draft
confidence: high
source: ddmm-dtp-mockup.md
owner: Creditor Portal
sla:
condition:
systems: [SYS-DDMM-001]
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-19
---
## What happens
A mandate request arrives via the Creditor Portal and is automatically passed to the validation step with no human touch. The payload varies by request type: a new mandate carries the full set — UMR, CI, debtor name, debtor IBAN, mandate type, and signature date; an amendment carries the UMR plus only the field or fields being changed, and a new signature date where the debtor re-signs; a cancellation carries the UMR and a cancellation reason.

## Inputs
- UMR (all request types)
- CI, debtor name, debtor IBAN, mandate type, signature date (new mandates)
- Field(s) being changed and new signature date (amendments)
- Cancellation reason (cancellations)

## Outputs
- Inbound mandate request lodged in the Creditor Portal
- Data payload passed to the validation step

## Why it matters
This is the process entry point; completeness and accuracy of the submitted data determines whether subsequent validation can proceed without rework.

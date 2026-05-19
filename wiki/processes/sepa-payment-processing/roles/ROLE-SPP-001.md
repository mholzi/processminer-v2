---
id: ROLE-SPP-001
type: role
section: roles
title: Customer
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
provenance: {"In this process": {"evidence": "Drop 'or channel'. And the customer isn't just informed — they re-engage to correct a rejected instruction and to do fraud step-up.", "source": "elicited"}, "Responsibility": {"evidence": "Keep the submission paths — online, mobile, file upload, branch capture; we're not splitting branch capture out this run.", "source": "elicited"}}
approval: approved
approvalBy: Markus
approvalDate: 2026-05-18
---
## Responsibility
Initiates the payment instruction that triggers the process — submitting it via online or mobile banking, uploading it as a payment file, or having a branch user capture it on their behalf.

## In this process
Submits the payment instruction and is accountable for it. The customer is informed of the outcome of validation, screening, clearing and confirmation, and re-engages where needed: correcting and resubmitting an instruction rejected at validation (E-1), and completing step-up verification when fraud holds a payment (E-4).

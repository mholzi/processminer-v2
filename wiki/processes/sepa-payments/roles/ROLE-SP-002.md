---
id: ROLE-SP-002
type: role
section: roles
title: Payments Operations
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
systems: [SYS-SP-002, SYS-SP-003]
controls: [CP-SP-009, CP-SP-010, CP-SP-003, CP-SP-006, CP-SP-007]
provenance: {"In this process": {"evidence": "RACI-backed assignments: ps-2 Validate=R, ps-3 Funds check=R, ps-4 Sanctions=C, ps-5 Fraud=C, ps-6 Bulk-file release=R, ps-8 Submit to CSM=R, ps-9 Confirmation=R, ps-10 R-transaction=A/R. Step 10 narrative: 'submitted payments are reconciled against CSM settlement reports.' Control C-6 / RACI row support the bulk-file 4-eyes claim. Routing decision (Section 5.1 step 6) and debit booking (Section 5.1 step 7) are described in the narrative but have no explicit RACI rows — Payments Ops R-assignments for those steps are inferred from overall operational ownership.", "source": "proposed"}, "Responsibility": {"evidence": "RACI table Section 4: Payments Ops = R for Validate instruction, Funds check, Bulk-file release, Submit to clearing (CSM), Confirmation to customer; A/R for R-transaction handling. Section 1 / Section 2 scope describes outbound SEPA payments as the process.", "source": "document"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:15Z
---
## Responsibility
Owns end-to-end operational execution of outbound SEPA payments, from instruction validation through clearing submission, settlement confirmation and end-of-day reconciliation.

## In this process
Payments Operations is Responsible for validating payment instructions (ps-2), performing the funds check and account hold (ps-3), routing the payment to the appropriate SEPA rail (ps-6), booking the debit (ps-7), submitting the pacs.008 to the CSM (ps-8), sending confirmation to the customer (ps-9), and running end-of-day reconciliation against CSM settlement reports (ps-10). It is Accountable and Responsible for R-transaction handling. For sanctions and fraud screening (ps-4, ps-5) Payments Operations is Consulted. Bulk-file release requires a second approver (4-eyes control cp-6); Operations raises the file for approval.

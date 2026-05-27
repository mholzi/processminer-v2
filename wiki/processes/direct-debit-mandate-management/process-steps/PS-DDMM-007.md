---
id: PS-DDMM-007
type: process-step
section: process-steps
title: Handle R-Transaction
status: draft
confidence: high
source: ddmm-dtp-mockup.md
owner: Mandate Clerk
sla: Within 2 business days of identification
condition: Triggered by inbound R-transaction from debtor bank
systems: [SYS-DDMM-002, SYS-DDMM-003]
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-19
---
## What happens
When an inbound R-transaction arrives, the Mandate Clerk identifies the reason code and acts: MD01 (no valid mandate) — Clerk checks MMS; if mandate genuinely absent, creditor notified and collection reversed; if MMS shows it valid, Clerk re-presents or escalates to Payments Ops Lead as a suspected wrongful reject. MD02 (data incorrect) — mandate corrected, creditor asked to re-present. AC04 (account closed) — mandate set to Dormant, creditor notified. SL01 (debtor restriction) — Clerk manually sets restriction flag in MMS from the R-transaction; no creditor notification.

## Inputs
- Inbound R-transaction message with SEPA reason code
- Referenced mandate record from MMS
- Payment Hub notification

## Outputs
- Updated mandate record (corrected / Dormant / restriction-flagged per reason code)
- Creditor notification with resolution outcome (MD01, MD02, AC04 only — not SL01)
- Reversed collection entry (MD01 only)

## Why it matters
Unresolved R-transactions leave mandate records in an inconsistent state and may delay or prevent future creditor collections.

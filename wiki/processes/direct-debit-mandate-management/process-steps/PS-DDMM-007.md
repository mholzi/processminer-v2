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
transitions: []
systems: [SYS-DDMM-002, SYS-DDMM-003]
provenance: {"Inputs": {"evidence": "When an inbound R-transaction referencing a mandate is received, the Mandate Clerk identifies the reason code and acts.", "source": "document"}, "Outputs": {"evidence": "MD01, MD02 and AC04 always end in a creditor notification. SL01 does NOT notify the creditor — the restriction is applied silently.", "source": "elicited"}, "What happens": {"evidence": "MD01: Clerk investigates against MMS. If genuinely absent/cancelled: creditor notified, collection reversed. If MMS shows valid mandate: suspected wrongful reject — re-present or escalate to Payments Ops Lead. Compliance not involved in MD01. SL01: Clerk sets restriction flag manually in MMS, transcribing from R-transaction; not auto-applied. Creditor notification: MD01/MD02/AC04 always; SL01 no notification — restriction applied silently.", "source": "elicited"}, "Why it matters": {"evidence": "Confirmed as drafted.", "source": "elicited"}}
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

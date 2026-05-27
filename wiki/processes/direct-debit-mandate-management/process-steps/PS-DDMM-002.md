---
id: PS-DDMM-002
type: process-step
section: process-steps
title: Validate Mandate Data
status: draft
confidence: high
source: ddmm-dtp-mockup.md
owner: Mandate Clerk
sla:
condition:
systems: [SYS-DDMM-001, SYS-DDMM-005]
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## What happens
Validation runs automatically (CP-DDMM-001); the Mandate Clerk steps in only on failures or ambiguous flags. Scope varies by request type. A new mandate is checked in full: the UMR is unique and well-formed; the debtor IBAN passes checksum and reachability validation; the Creditor Identifier is active; and mandate type and sequence are consistent. An amendment validates only the changed field(s), re-runs IBAN reachability if the IBAN changed, and confirms the UMR exists and is active in MMS. A cancellation checks only that the UMR exists and is active — no further validation applies.

## Inputs
- UMR (all request types)
- CI, debtor name, debtor IBAN, mandate type, signature date (new mandates)
- Changed field(s) only (amendments)
- Active Creditor Identifier registry (new mandates)
- IBAN reachability service via Core Banking System (new mandates; and amendments where IBAN changes)
- MMS mandate record confirming UMR exists and is active (amendments and cancellations)

## Outputs
- Validated mandate data cleared for sanctions screening
- Rejection notice with reason code (on failure)

## Why it matters
Catching data errors here prevents invalid mandates from entering the Mandate Management System and reduces downstream processing failures.

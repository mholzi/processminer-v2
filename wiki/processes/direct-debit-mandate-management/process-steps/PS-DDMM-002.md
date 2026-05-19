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
transitions: [PS-DDMM-003|normal|mandate data valid and complete, EX-DDMM-001|exception|mandate data invalid or incomplete, EX-DDMM-003|exception|duplicate UMR detected]
systems: [SYS-DDMM-001, SYS-DDMM-005]
provenance: {"Inputs": {"evidence": "New mandate gets full set. Amendment validates only changed field(s), re-runs IBAN checksum/reachability if IBAN changed, and checks UMR exists and is active. Cancellation: only UMR exists and is currently active in MMS.", "source": "elicited"}, "Outputs": {"evidence": "Both accurate as drafted.", "source": "elicited"}, "What happens": {"evidence": "Validation is automated-first (CP-DDMM-001); Mandate Clerk on exception. New mandate: full checks. Amendment: changed fields only, re-run IBAN if IBAN changed, confirm UMR exists and active. Cancellation: only UMR exists and active in MMS.", "source": "elicited"}, "Why it matters": {"evidence": "Accurate as drafted.", "source": "elicited"}}
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

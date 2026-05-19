---
id: PS-CAC-007
type: process-step
section: process-steps
title: Execute closure
status: draft
confidence: high
source: account-closure-dtp-mockup.md
owner: Closure Analyst
systems: [SYS-CAC-002]
transitions: [PS-CAC-008|normal|always]
provenance: {"Inputs": {"evidence": "Auto-approve: internally coherent and conformant. — M. Berger", "source": "elicited"}, "Outputs": {"evidence": "The accounts are set to 'Closed' in the core banking system; cards and payment instruments linked to the accounts are cancelled.", "source": "document"}, "What happens": {"evidence": "The accounts are set to 'Closed' in the core banking system; cards and payment instruments linked to the accounts are cancelled.", "source": "document"}, "Why it matters": {"evidence": "Auto-approve: internally coherent and conformant. — M. Berger", "source": "elicited"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-19
---
## What happens
The Closure Analyst sets all accounts to Closed in the Core Banking System and cancels all cards and payment instruments linked to the accounts.

## Inputs
- Approved closure authorisation from step 6
- List of in-scope accounts and linked instruments

## Outputs
- Accounts marked as Closed in the Core Banking System
- Cards and payment instruments cancelled

## Why it matters
Formally closes the accounts in the system of record, preventing any further transactions and completing the offboarding.

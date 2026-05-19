---
id: SYS-CAC-002
type: system
section: systems
title: Core Banking System
status: draft
confidence: high
source: account-closure-dtp-mockup.md
systemType: CORE
provenance: {"Purpose": {"evidence": "Core Banking System | Account status change, instrument cancellation", "source": "document"}, "Role in this process": {"evidence": "The accounts are set to \"Closed\" in the core banking system; cards and payment instruments linked to the accounts are cancelled.", "source": "document"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-19
---
## Purpose
System of record for account status and instrument management.

## Role in this process
Used in step 7 to set accounts to Closed and cancel all cards and payment instruments linked to the accounts.

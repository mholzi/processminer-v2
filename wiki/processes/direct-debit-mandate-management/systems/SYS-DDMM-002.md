---
id: SYS-DDMM-002
type: system
section: systems
title: Mandate Management System (MMS)
status: draft
confidence: high
source: ddmm-dtp-mockup.md
systemType: CORE
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-19
integrates: [SYS-DDMM-001, SYS-DDMM-004, SYS-DDMM-005, SYS-DDMM-003]
---
## Purpose
System of record for all SEPA Direct Debit mandates managed by the bank on behalf of corporate creditor clients.

## Role in this process
Read at Step 2 for UMR and existing-record lookup; written at Step 3 to set Pending Compliance hold on potential hits; written at Step 5 to create, amend, or cancel records; updated at Step 7 during R-transaction handling.

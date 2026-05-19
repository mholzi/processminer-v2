---
id: SYS-FR-002
type: system
section: systems
title: Core Banking System
status: draft
confidence: high
source: funds-release-dtp-mockup.md
systemType: CORE
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-18
---
## Purpose
The bank's core ledger for account postings and fund movements; it holds the blocked/held account in which release funds sit.

## Role in this process
At execution it posts the approved release, moving held funds to the beneficiary, or rejects the posting on insufficient funds or a ledger-side failure, feeding EX-FR-005. It is also the system of record for released movements in the CP-FR-005 reconciliation.

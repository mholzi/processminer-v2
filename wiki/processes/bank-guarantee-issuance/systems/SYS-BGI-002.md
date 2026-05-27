---
id: SYS-BGI-002
type: system
section: systems
title: Trade Finance System
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
systemType: CORE
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-20
---
## Purpose
System of record for guarantee instruments, approvals and facility utilisation.

## Role in this process
Receives application data via INT-BGI-001 (step 1); holds the approved template library (step 3); enforces the facility limit check and records approvals (steps 2, 5); generates the guarantee instrument (step 6). Facility utilisation updated manually by the TFO post-SWIFT.

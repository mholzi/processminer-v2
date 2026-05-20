---
id: SYS-BGI-002
type: system
section: systems
title: Trade Finance System
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
systemType: CORE
provenance: {"Purpose": {"evidence": "Trade Finance System — the system of record for guarantee instruments, approvals and facility utilisation.", "source": "document"}, "Role in this process": {"evidence": "Step 1: receives basic capture fields from Corporate Portal via INT-BGI-001. Step 3: holds the approved guarantee template library the TFO selects from for standard-wording cases. Steps 2 and 5: enforces facility limit check and records approvals. Step 6: generates the guarantee instrument; client facility utilisation record is held here but updated manually by the TFO after SWIFT transmission.", "source": "elicited"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-20
---
## Purpose
System of record for guarantee instruments, approvals and facility utilisation.

## Role in this process
Receives application data via INT-BGI-001 (step 1); holds the approved template library (step 3); enforces the facility limit check and records approvals (steps 2, 5); generates the guarantee instrument (step 6). Facility utilisation updated manually by the TFO post-SWIFT.

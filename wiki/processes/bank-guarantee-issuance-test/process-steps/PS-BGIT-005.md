---
id: PS-BGIT-005
type: process-step
section: process-steps
title: Issuance Approval
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
owner: Trade Finance Manager
transitions: [PS-BGIT-006|normal|approved]
provenance: {"Inputs": {"evidence": "M. Berger: standing approval", "source": "elicited"}, "Outputs": {"evidence": "M. Berger: standing approval", "source": "elicited"}, "What happens": {"evidence": "", "source": "proposed"}, "Why it matters": {"evidence": "M. Berger: standing approval", "source": "elicited"}}
systems: [SYS-BGIT-002]
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-20
---
## What happens
A Trade Finance Manager reviews the assembled guarantee package and approves issuance. Guarantees above EUR 2 million, or any partially-secured (collateral-backed) guarantee regardless of amount, additionally require sign-off by the Head of Trade Finance. Approval is recorded in the Trade Finance System.

## Inputs
- Assembled application package with completed checks
- Confirmed screening result
- Wording approval (for bespoke guarantees)

## Outputs
- Approved guarantee package recorded in Trade Finance System
- Dual sign-off for guarantees above EUR 5 million

## Why it matters
The four-eyes approval control ensures no guarantee is issued without senior review, reducing issuance errors and unauthorised commitment risk.

---
id: PS-CAC-004
type: process-step
section: process-steps
title: Compliance and sanctions check
status: draft
confidence: high
source: account-closure-dtp-mockup.md
owner: Compliance
systems: [SYS-CAC-003]
transitions: [PS-CAC-005|normal|no open compliance case, EX-CAC-003|exception|open compliance case or sanctions hit]
provenance: {"Inputs": {"evidence": "Y — record those and approve PS-CAC-004. — M. Berger", "source": "elicited"}, "Outputs": {"evidence": "Financial Crime and Compliance are the same function — it's called Compliance. — Markus, 2026-05-19", "source": "elicited"}, "What happens": {"evidence": "Financial Crime and Compliance are the same function — it's called Compliance. — Markus, 2026-05-19", "source": "elicited"}, "Why it matters": {"evidence": "Y — record those and approve PS-CAC-004. — M. Berger", "source": "elicited"}}
approval: approved
approvalBy: Markus
approvalDate: 2026-05-19
---
## What happens
When the Closure Analyst advances the case in the Client Lifecycle Workflow Tool, an automated combined query is triggered against the Sanctions Screening Engine covering both sanctions exposure and any open internal compliance cases. Compliance reviews and adjudicates all screening results. For BANK-RISK coded closures the identical screen runs — there is no shortcut. Either a live sanctions hit or an open internal compliance case routes to Compliance and blocks closure until resolved (Exception E-3).

## Inputs
- Obligations-cleared closure case from step 3
- Client and account identifiers for screening

## Outputs
- Sanctions and compliance screening result
- Case progressed to residual balance disbursement, or blocked pending Compliance resolution (E-3)

## Why it matters
Prevents the bank from closing an account subject to sanctions or an active compliance investigation, protecting against regulatory exposure.

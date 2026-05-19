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
provenance: {"Inputs": {"evidence": "Y — record those and approve PS-CAC-004. — M. Berger", "source": "elicited"}, "Outputs": {"evidence": "Y — record those and approve PS-CAC-004. — M. Berger", "source": "elicited"}, "What happens": {"evidence": "Closure Analyst advances case in workflow tool, which triggers automated screen; Compliance reviews and adjudicates any result. BANK-RISK cases still run identical screen — no shortcut. One combined query; sanctions hit routes directly to Financial Crime, existing internal compliance case stays with Compliance. — M. Berger", "source": "elicited"}, "Why it matters": {"evidence": "Y — record those and approve PS-CAC-004. — M. Berger", "source": "elicited"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-19
---
## What happens
When the Closure Analyst advances the case in the Client Lifecycle Workflow Tool, an automated combined query is triggered against the Sanctions Screening Engine covering both sanctions exposure and any open internal compliance cases. Compliance reviews and adjudicates all screening results. For BANK-RISK coded closures the identical screen runs — there is no shortcut. A live sanctions hit routes the case directly to Financial Crime; an existing internal compliance case routes to the Compliance function. Either outcome blocks closure until resolved (Exception E-3).

## Inputs
- Obligations-cleared closure case from step 3
- Client and account identifiers for screening

## Outputs
- Sanctions and compliance screening result
- Case progressed to residual balance disbursement, or blocked pending resolution (E-3 — Financial Crime if sanctions hit; Compliance function if internal compliance case)

## Why it matters
Prevents the bank from closing an account subject to sanctions or an active compliance investigation, protecting against regulatory exposure.

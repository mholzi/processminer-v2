---
id: TD-CAC-007
type: transformation-decision
section: transformation-decisions
title: Implement a digital time-bound closure reversal workflow
status: draft
confidence: medium
source: M. Berger; source-target synthesis — corporate-account-closure wiki
decisionType: process-redesign
decisionStatus: proposed
resolves: [PG-CAC-004]
realises: [TS-CAC-004]
fromIdea: [II-CAC-004]
provenance: {"Options considered": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "Rationale": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "The decision": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}}
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-19
---
## The decision
Define a time-bound reversal window (e.g. T+5 business days post-execution) and configure a digital reversal workflow in the Client Lifecycle Workflow Tool and Core Banking System, enabling a Closure Approver to reinstate a closed account, trigger re-credit of any disbursed balance, and generate a complete audit trail.

## Options considered
- Digital reversal workflow within the existing Client Lifecycle Workflow Tool with a defined window (T+5 business days)
- Manual escalation procedure without a system workflow
- Declare closure strictly irreversible and document the no-reversal policy
- Define a longer reversal window (e.g. T+10 business days) to accommodate slow-returning disbursements

## Rationale
A digital workflow with a defined window is the only option that closes PG-CAC-004 with an auditable trail. Manual escalation without a workflow fails to provide the documented procedure the gap requires. Strict irreversibility harms clients where an account is closed in error.

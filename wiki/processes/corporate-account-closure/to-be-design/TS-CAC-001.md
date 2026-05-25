---
id: TS-CAC-001
type: target-state
section: to-be-design
title: Agentic AI orchestration of back-office closure checks
status: draft
confidence: medium
source: M. Berger; source-target synthesis — corporate-account-closure wiki
replaces: [PS-CAC-003, PS-CAC-004, PS-CAC-006]
provenance: {"Rationale": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "Target description": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "What changes": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}}
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-19
---
## Target description
An AI orchestration agent autonomously assembles and validates the closure file — querying the Core Banking System and General Ledger for obligations clearance, triggering the sanctions and compliance screen, and surfacing a pre-validated closure package to the Closure Approver for a single human decision gate. The agent replaces the current sequential, analyst-driven back-office steps with a parallel, governed workflow that humans oversee rather than execute step by step.

## What changes
- The obligations check (step 3) becomes an agent-driven parallel query across Core Banking and General Ledger, replacing the sequential analyst check plus Finance's 2-business-day workflow task with automated pre-condition validation
- The compliance/sanctions screen (step 4) is upgraded to AI-enhanced real-time screening with explainable risk scores and an automated audit trail, replacing the current point-in-time query
- The 4-eyes approval gate (step 6) is reframed: the Closure Approver reviews an AI-assembled pre-validated case file rather than checking each step output manually
- Post-closure reconciliation (CP-CAC-006) is automated, replacing the daily manual Finance review
- Dormancy case creation (DORMANCY closure code, step 1) is driven by an AI monitoring agent on Core Banking, replacing the current reliance on manual dormancy review output

## Rationale
Agentic AI reduces the multi-day cycle time for back-office checks and lowers operational risk from manual hand-offs, while retaining the human decision gate at step 6 to satisfy MaRisk four-eyes requirements. ING, Fiserv agentOS and market trend TR-CAC-001 establish this as a credible near-term deployment.

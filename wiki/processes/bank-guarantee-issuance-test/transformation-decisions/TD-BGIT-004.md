---
id: TD-BGIT-004
type: transformation-decision
section: transformation-decisions
title: Implement system-enforced post-approval generation gate in Trade Finance System
status: draft
confidence: high
source: source-target — bank-guarantee-issuance-test wiki
decisionType: configuration
decisionStatus: agreed
resolves: [CG-BGIT-002]
realises: [TS-BGIT-003]
fromIdea: [II-BGIT-004]
provenance: {"Options considered": {"evidence": "M. Berger Stage 5 refinement session, 2026-05-20 — confirmed transformation decision from source-target stub", "source": "elicited"}, "Rationale": {"evidence": "M. Berger Stage 5 refinement session, 2026-05-20 — confirmed transformation decision from source-target stub", "source": "elicited"}, "The decision": {"evidence": "M. Berger Stage 5 refinement session, 2026-05-20 — confirmed transformation decision from source-target stub", "source": "elicited"}}
---
## The decision
Configure the Trade Finance System to enforce a hard gate at the guarantee generation step: generation is blocked unless a valid TFM approval record exists for the transaction in TFS, converting the current manual dependency into a hard system control.

## Options considered
- Hard TFS gate: generation blocked without a valid TFM approval record
- Soft TFS warning: generation permitted but flagged for post-generation reconciliation audit
- Periodic manual reconciliation of generation events against approval records
- Accept the control gap as low-severity risk with no system change

## Rationale
A hard gate is the only option that closes CG-BGIT-002 with certainty. Soft warnings and audit reconciliation both allow unapproved issuance to occur before detection — the exact failure mode the control is designed to prevent. The approval data already exists in TFS; only a workflow rule is required.

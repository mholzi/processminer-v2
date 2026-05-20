---
id: TS-BGIT-002
type: target-state
section: to-be-design
title: AI-assisted wording review with integrated in-system Legal workflow
status: draft
confidence: high
source: source-target — bank-guarantee-issuance-test wiki
replaces: [PS-BGIT-003]
systems: [SYS-BGIT-002]
provenance: {"Rationale": {"evidence": "M. Berger Stage 5 refinement session, 2026-05-20 — confirmed target state from source-target stub", "source": "elicited"}, "Target description": {"evidence": "M. Berger Stage 5 refinement session, 2026-05-20 — confirmed target state from source-target stub", "source": "elicited"}, "What changes": {"evidence": "M. Berger Stage 5 refinement session, 2026-05-20 — confirmed target state from source-target stub", "source": "elicited"}}
---
## Target description
Bespoke guarantee wording is reviewed with the support of an AI wording assistant embedded in the Trade Finance System, trained on URDG 758 and the bank's approved template library. The TFO uses the assistant to pre-validate wording before routing to Legal, reducing the volume requiring full Legal review. Legal review requests are managed through an in-TFS workflow with an explicit SLA timer replacing the email handoff, with escalation to Head of Legal on breach.

## What changes
- AI wording assistant embedded in TFS pre-validates bespoke wording against URDG 758 and approved templates before Legal routing
- Legal review is initiated through an in-TFS workflow, replacing the current email-only handoff (PG-BGIT-002)
- Formal SLA timer tracks Legal review turnaround; breach triggers automatic escalation to Head of Legal
- Full audit trail of wording review decisions is maintained in TFS

## Rationale
Email-based Legal handoff creates an untracked, SLA-free bottleneck that is the root cause of the bespoke wording delay pattern. An in-system workflow with AI pre-screening and an enforced SLA converts an opaque exception into a predictable, audited process step.

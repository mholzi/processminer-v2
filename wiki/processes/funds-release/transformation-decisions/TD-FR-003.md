---
id: TD-FR-003
type: transformation-decision
section: transformation-decisions
title: Agentic AI kept strictly preparatory
status: draft
confidence: medium
source: SME interview - M. Berger
decisionType: Governance
decisionStatus: proposed
realises: [TS-FR-004]
fromIdea: [II-FR-004, II-FR-007]
---
## The decision
Use agentic AI in Funds Release only in a preparatory role — triaging items, auto-logging exceptions and pre-assembling work for approvers — with a hard human-in-the-loop boundary so that every release approval decision remains with a person.

## Options considered
- Full agentic decisioning — agents authorise routine releases autonomously
- Agent-assisted, with humans retaining every approval decision
- No agentic AI — keep all triage and preparation manual

## Rationale
Full agentic decisioning would compress cost the most but put a financial-crime and segregation-of-duties decision in a machine's hands, and risks an agent breaching 4-eyes (IR-FR-003). Keeping agents preparatory captures most of the efficiency gain while leaving accountability and dual-control unambiguously human — the only posture defensible on a funds-release process.

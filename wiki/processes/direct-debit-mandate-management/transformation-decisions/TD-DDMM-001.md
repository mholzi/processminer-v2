---
id: TD-DDMM-001
type: transformation-decision
section: transformation-decisions
title: Implement SLA-Aware Intelligent Work Queue in MMS
status: draft
confidence: high
source: ddmm-transformation-agent
decisionType: PROCESS
decisionStatus: DECIDED
resolves: [PP-DDMM-004]
realises: [TS-DDMM-001]
fromIdea: [II-DDMM-001]
---
## The decision
Implement an SLA-aware priority queue in MMS that scores all incoming mandate work by type, SLA remaining, and creditor risk tier, replacing the current undifferentiated inbox.

## Options considered
- Manual triage via daily stand-up and team-lead allocation (current state — no system change)
- SLA-aware queue with automatic scoring in MMS (chosen)
- Separate workflow management tool outside MMS (additional system, integration overhead)

## Rationale
A separate workflow tool adds integration complexity and a new system dependency — MMS already holds all mandate records and SLA data. Automatic scoring within MMS requires no data movement and makes priority visible to all operators simultaneously.

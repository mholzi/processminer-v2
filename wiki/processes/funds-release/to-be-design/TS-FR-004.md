---
id: TS-FR-004
type: target-state
section: to-be-design
title: Instrumented, agent-assisted manual & exception path
status: draft
confidence: medium
source: SME interview - M. Berger
replaces: [PS-FR-002, PS-FR-004, PS-FR-006]
systems: [SYS-FR-001]
risks: [IR-FR-003]
---
## Target description
The manual and exception path is instrumented and agent-assisted while keeping every approval decision human. The workflow captures actual turnaround for STP releases, manual releases and exception resolution in real time against target. An agentic-AI layer triages and auto-logs every off-happy-path item — including the suspended-facility bounce that leaves no record today — and pre-assembles each item for the second-line approver. Agents prepare and route; they never approve. The human-in-the-loop boundary at every approval is explicit and enforced.

## What changes
- Real-time instrumentation measures actual STP, manual and exception turnaround against target, replacing unmeasured metrics
- An agentic triage layer classifies and auto-logs every off-happy-path item, including the suspended-facility bounce
- An agentic assistant pre-assembles each item for the second-line approver, easing the thin approver bench
- Agents prepare and route only; every approval decision remains with a human

## Rationale
The manual path carries no measured baseline, an unlogged exception and a structurally thin approver bench. Instrumentation and agentic assistance close those gaps and free scarce analysts for judgement — while a hard human-in-the-loop boundary keeps agentic error and 4-eyes breach (IR-FR-003) contained.

---
id: TS-DDMM-001
type: target-state
section: to-be-design
title: SLA-Driven Intelligent Work Queue
status: draft
confidence: high
source: ddmm-transformation-agent
replaces: [PS-DDMM-001, PS-DDMM-007]
systems: [SYS-DDMM-002]
risks: []
provenance: {"Rationale": {"evidence": "SME confirmed: PP-DDMM-004 is the highest systemic operational cost; framing accepted without edit.", "source": "elicited"}, "Target description": {"evidence": "SME (M. Vogel) confirmed: 'makes operational exposure visible before it becomes failure is the right framing'; structure and scope accepted without edit.", "source": "elicited"}, "What changes": {"evidence": "SME confirmed all five change bullets — accepted without edit.", "source": "elicited"}}
approval: approved
approvalBy: Markus
approvalDate: 2026-05-19
---
## Target description
All incoming mandate work — new registrations, amendments, cancellations, and R-transactions — flows through a single prioritised queue in MMS. Each item is automatically scored by work type, SLA remaining, and creditor risk tier; the queue surfaces the highest-priority items first. Operational dashboards give team leads real-time visibility of SLA exposure and workload distribution, replacing the current flat inbox model where urgency is invisible until SLAs are already at risk.

## What changes
- Undifferentiated inbox replaced by an MMS queue with automatic priority scoring per item
- SLA remaining calculated per item; items approaching breach flagged proactively
- Priority score combines work type, SLA proximity, and creditor risk tier
- Team leads gain a live dashboard of queue depth, priority distribution, and SLA status
- R-transactions surface in the same prioritised queue as registration work, scored against the 2-day resolution SLA (M-DDMM-003)

## Rationale
PP-DDMM-004 is the highest systemic operational cost — staff triage from a flat inbox where urgency is invisible until SLAs are already at risk. Intelligent prioritisation makes operational exposure visible before it becomes failure, without restructuring the underlying process steps.

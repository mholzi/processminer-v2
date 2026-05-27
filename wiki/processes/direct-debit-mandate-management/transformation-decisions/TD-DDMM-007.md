---
id: TD-DDMM-007
type: transformation-decision
section: transformation-decisions
title: Extend Sanctions Screening to Amendments and Cancellations and Add Periodic Re-Screening
status: draft
confidence: high
source: ddmm-transformation-agent
decisionType: COMPLIANCE
decisionStatus: DECIDED
resolves: [CG-DDMM-004, PG-DDMM-006]
realises: [TS-DDMM-006]
fromIdea: []
---
## The decision
Extend CP-DDMM-002 sanctions screening to cover IBAN amendments and cancellations; implement periodic re-screening of the active mandate register on a Compliance-defined schedule and ownership.

## Options considered
- Maintain registration-only screening (current state — non-compliant, rejected)
- Extend to amendments/cancellations and add periodic re-screening (chosen)
- Extend to amendments/cancellations only, without periodic re-screening (partial — CG-DDMM-004 remains open)

## Rationale
Extending to amendments and cancellations only, without periodic re-screening, still leaves a designated party undetected between transaction events. EU sanctions regulations and GwG impose continuous, not point-in-time, screening obligations. Both extensions are required together to achieve compliance.

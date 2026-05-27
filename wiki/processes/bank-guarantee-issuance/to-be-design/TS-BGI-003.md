---
id: TS-BGI-003
type: target-state
section: to-be-design
title: Controlled Wording Review with Conformance Guardrails and Formalised Legal SLA
status: draft
confidence: low
replaces: [PS-BGI-003]
---
## Target description
The wording review step operates with two new controls. First, a system-enforced template-conformance check prevents mis-designated standard cases from bypassing Legal review. Second, bespoke guarantee reviews operate under a formal SLA between Trade Finance and the Legal desk, with a digital workflow tracking submission, acknowledgement and sign-off dates and triggering automatic escalation when at risk.

## What changes
- Template selection validated by the TFS against the wording-type field set at intake — mismatch blocks progression
- Formal SLA agreed between Trade Finance and Legal desk for bespoke reviews with a 2-business-day target
- Digital workflow tracks Legal review status with automatic escalation on SLA breach
- Clients receive a reliable delivery commitment for bespoke guarantees
- CG-BGI-002 closed by system conformance check

## Rationale
Two independent problems afflict wording review — a missing conformance control and unpredictable bespoke turnaround. A system guardrail closes the control gap; an SLA and workflow makes delivery predictable. Both are low-complexity changes that can progress in parallel.

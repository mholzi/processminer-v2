---
id: TD-DDMM-006
type: transformation-decision
section: transformation-decisions
title: Introduce R-Transaction Pre-Classification and Mandatory Structured Rationale
status: draft
confidence: high
source: ddmm-transformation-agent
decisionType: TECHNOLOGY
decisionStatus: DECIDED
resolves: [PP-DDMM-001, OAF-DDMM-002]
realises: [TS-DDMM-005]
fromIdea: [II-DDMM-004]
provenance: {"Options considered": {"evidence": "SME confirmed options and rationale — accepted without edit.", "source": "elicited"}, "Rationale": {"evidence": "SME confirmed rationale — accepted without edit.", "source": "elicited"}, "The decision": {"evidence": "SME (M. Vogel) accepted all ten decisions without edit.", "source": "elicited"}}
---
## The decision
Implement MMS R-transaction pre-classification by reason code with guided code-specific resolution checklists; make structured rationale capture mandatory at point of closure — the item cannot be closed without it.

## Options considered
- Publish a static R-transaction handling guide for clerks (no decision support, no rationale enforcement)
- MMS pre-classification with guided checklist and mandatory structured closure field (chosen)
- Full automated resolution without clerk review (not feasible — each code requires case-level judgement)

## Rationale
A static guide does not surface at point of work and cannot enforce consistent rationale capture. Full automation is not viable — R-transaction resolution requires clerk judgement on each case. MMS-embedded guidance with mandatory closure fields enforces OAF-DDMM-002 as a system constraint rather than a convention.

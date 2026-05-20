---
id: TD-BGI-003
type: transformation-decision
section: transformation-decisions
title: Enforce Template-Conformance Validation in Trade Finance System
status: draft
confidence: low
resolves: [CG-BGI-002]
realises: [TS-BGI-003]
fromIdea: [II-BGI-005]
provenance: {"Options considered": {"evidence": "", "source": "proposed"}, "Rationale": {"evidence": "", "source": "proposed"}, "The decision": {"evidence": "", "source": "proposed"}}
decisionType: build
decisionStatus: proposed
---
## The decision
Add a system-enforced field-level validation rule to the Trade Finance System that cross-checks the wording-type field against the selected template and blocks application progression on a mismatch.

## Options considered
- System-enforced field cross-check rule in the TFS blocking progression on mismatch
- Checklist-based TFO self-verification of template selection before submission
- Additional TFM review of wording type at the approval step

## Rationale
A system rule enforces the check unconditionally, preventing the blind spot where mis-designation is itself undetected. Checklists and additional manual review depend on human attention and cannot reliably catch a case where the TFO is unaware of the mismatch.

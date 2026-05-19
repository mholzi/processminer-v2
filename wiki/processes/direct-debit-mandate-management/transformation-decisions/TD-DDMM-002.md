---
id: TD-DDMM-002
type: transformation-decision
section: transformation-decisions
title: Deploy Inline Portal Validation with Remediation Guidance
status: draft
confidence: high
source: ddmm-transformation-agent
decisionType: TECHNOLOGY
decisionStatus: DECIDED
resolves: [FP-DDMM-001, FP-DDMM-002]
realises: [TS-DDMM-002]
fromIdea: [II-DDMM-003]
provenance: {"Options considered": {"evidence": "SME confirmed options and rationale — accepted without edit.", "source": "elicited"}, "Rationale": {"evidence": "SME confirmed rationale — accepted without edit.", "source": "elicited"}, "The decision": {"evidence": "SME (M. Vogel) accepted all ten decisions without edit.", "source": "elicited"}}
---
## The decision
Extend the Creditor Portal with inline field-level validation and per-rejection-type remediation guidance for both single-mandate submissions and bulk file line-item rejections.

## Options considered
- Maintain current bare error-code approach (no change)
- Inline portal validation with human-readable messages and remediation guidance (chosen)
- Publish a static remediation guidance document linked from rejection notices

## Rationale
A static document requires creditors to cross-reference outside the portal and does not survive to the correction screen. Inline guidance at point of failure closes the loop immediately, reducing iteration cycles without an additional navigation step.

---
id: CAP-BGID-002
type: capability
section: capabilities
title: Wording Classification & Standard-Template Selection
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
criticality: HIGH
reuse: NEW
owningDomain: Trade Finance
hostedIn: [TGTAPP-BGID-002]
realisesStep: [TS-BGID-003]
provenance: {"Boundaries": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Description": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Inputs and outputs": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T14:59:49Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Description
Classifies incoming guarantee wording against the bank's approved template library to determine whether wording is standard or bespoke. Standard matches are auto-approved and advance to the credit and facility check. Bespoke cases are routed to the bespoke wording review pipeline. Maintains the active template library as a versioned reference.

## Inputs and outputs
Inputs: guarantee wording text, guarantee type, commercial contract reference. Outputs: classification decision (standard or bespoke), matched template ID for standard cases, or bespoke routing trigger with a classification confidence score.

## Boundaries
Does not manage the bespoke review pipeline or Legal SLA — that is the bespoke wording pre-screening capability. Does not author or govern templates — template governance is owned by Legal. Does not perform credit or facility checks.

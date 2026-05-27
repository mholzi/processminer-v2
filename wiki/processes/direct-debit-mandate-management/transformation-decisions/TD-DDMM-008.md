---
id: TD-DDMM-008
type: transformation-decision
section: transformation-decisions
title: Obtain Scheme-Compliance Opinion on IBAN Amendment Treatment and Update Procedure
status: draft
confidence: high
source: ddmm-transformation-agent
decisionType: GOVERNANCE
decisionStatus: DECIDED
resolves: [CG-DDMM-002, PG-DDMM-004]
realises: [TS-DDMM-006]
fromIdea: []
---
## The decision
Engage Compliance and/or EPC to obtain a formal opinion on whether IBAN changes require a new UMR under SEPA SDD Scheme Rules; update CP-DDMM-001 and the amendment procedure to reflect the outcome.

## Options considered
- Continue treating IBAN changes as versioned amendments pending resolution (unresolved risk — current state)
- Obtain formal scheme-compliance opinion and update procedure accordingly (chosen)
- Treat all IBAN changes as new mandates proactively without awaiting opinion (operationally disruptive if opinion confirms amendment is valid)

## Rationale
Proactively converting all IBAN changes to new mandates before the opinion is received would force unnecessary re-registration. Continuing without one carries live scheme non-compliance risk. The only principled path is a formal opinion, with the procedure updated to match whichever outcome it confirms.

---
id: CAP-BGID-004
type: capability
section: capabilities
title: Sanctions & Compliance Screening
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
criticality: HIGH
reuse: REUSED
owningDomain: Compliance & Risk
hostedIn: [TGTAPP-BGID-003]
realisesStep: [TS-BGID-004]
provenance: {"Boundaries": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Description": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Inputs and outputs": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:00:11Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Description
Screens the applicant, beneficiary, and guarantee transaction against AMLD5 and AMLR sanctions lists and AML obligations using a hybrid model of automated list-matching and manual investigator review for flagged cases. Produces a compliance decision that is a precondition for issuance approval. Retained unchanged from the As-Is process.

## Inputs and outputs
Inputs: applicant identity, beneficiary details, transaction characteristics including amount, currency, and counterparty jurisdiction. Outputs: screening result (clear, flagged, or blocked), compliance record, manual referral trigger for flagged cases.

## Boundaries
Does not perform credit or facility assessment. Does not own sanctions list maintenance — depends on Compliance team feed management. Does not conduct manual investigations — triggers referral to the Compliance investigator queue.

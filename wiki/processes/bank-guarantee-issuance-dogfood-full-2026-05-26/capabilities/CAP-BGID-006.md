---
id: CAP-BGID-006
type: capability
section: capabilities
title: Guarantee Approval & Four-Eyes Authorisation
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
criticality: HIGH
reuse: REUSED
owningDomain: Trade Finance
hostedIn: [TGTAPP-BGID-001]
realisesStep: [TS-BGID-005]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:00:11Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Description
Enforces the mandatory dual-authorisation requirement for guarantee issuance: two authorised TFO signatories must independently approve each guarantee before the instrument can be generated. Records each approval with signatory ID, timestamp, and role, satisfying MaRisk BTO 1.2 dual-control obligations. Retained unchanged from the As-Is process.

## Inputs and outputs
Inputs: fully validated and screened application record, signatory credentials. Outputs: approval decision with both signatory records, compliance-grade dual-signatory audit trail entry.

## Boundaries
Does not perform credit, compliance, or wording checks — receives a fully checked application. Does not generate or dispatch the guarantee instrument. Does not manage TFO authentication — delegates to the corporate identity service.

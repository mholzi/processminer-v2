---
id: CAP-BGID-005
type: capability
section: capabilities
title: Facility Headroom & Limit Check
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
criticality: HIGH
reuse: NEW
owningDomain: Credit & Trade Finance
hostedIn: [TGTAPP-BGID-004, TGTAPP-BGID-005]
realisesStep: [TS-BGID-002]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T14:59:49Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Description
Exposes real-time facility headroom to the corporate client before application entry, enabling self-serve pre-qualification. At application processing time, performs the authoritative facility limit check — determining whether the requested guarantee amount is within the approved facility — and routes the application to auto-clear or Credit escalation with a pre-calculated shortfall amount.

## Inputs and outputs
Inputs: client and party ID, requested guarantee amount, currency, timestamp. Outputs: available headroom indicator for client self-serve, routing decision (auto-clear or Credit escalation), pre-calculated shortfall for escalated cases, facility utilisation event for post-issuance write.

## Boundaries
Does not own the credit facility record — reads from the credit system synchronously. Does not perform credit risk assessment for shortfall cases. Does not book facility utilisation at check time — the utilisation write is asynchronous post-issuance.

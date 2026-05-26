---
id: CAP-BGID-003
type: capability
section: capabilities
title: AI Bespoke-Wording Pre-Screening with Legal SLA
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
Manages the end-to-end review pipeline for guarantee applications classified as bespoke wording. Routes bespoke applications to the Legal review queue, enforces the published five-business-day maximum SLA, delivers client milestone notifications when review begins and SLA-risk alerts approaching the deadline, and records the Legal decision for onward processing.

## Inputs and outputs
Inputs: bespoke routing trigger from wording classification, Legal reviewer decision and annotations. Outputs: bespoke review decision (approved or escalated), SLA status record, client notification events, updated Legal queue dashboard.

## Boundaries
Does not classify wording as standard or bespoke — receives that decision from the wording classification capability. Does not perform the Legal review itself. Outbound notification events are published and consumed by the portal or API gateway.

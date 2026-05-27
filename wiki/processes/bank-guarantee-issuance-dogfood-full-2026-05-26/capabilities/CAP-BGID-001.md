---
id: CAP-BGID-001
type: capability
section: capabilities
title: Application Intake & Validation
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
criticality: HIGH
reuse: NEW
owningDomain: Trade Finance
hostedIn: [TGTAPP-BGID-001, TGTAPP-BGID-005]
realisesStep: [TS-BGID-001]
resolvesGap: [VG-BGID-001]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:00:10Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Description
Receives guarantee applications from the Corporate Portal and the ICC-SWIFT API channel. Enforces system-level completeness — mandatory fields including commercial contract reference — before a submission can advance. Auto-routes standard-template applications to the credit and facility check without TFO triage; holds non-standard applications in the TFO queue. Provides the canonical application-received event for downstream capabilities.

## Inputs and outputs
Inputs: structured application payload (portal or API), client identity, guarantee type, commercial contract reference. Outputs: a validated application record with a stable application ID, routing decision (auto-route or TFO queue), and an application-received domain event.

## Boundaries
Does not perform credit or facility assessment (downstream capability). Does not classify guarantee wording (wording classification capability). Does not manage client authentication — delegates to the corporate identity service.

---
id: CAP-BGID-008
type: capability
section: capabilities
title: Collateral Confirmation & Notification
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
criticality: MEDIUM
reuse: NEW
owningDomain: Treasury
hostedIn: [TGTAPP-BGID-001]
realisesStep: [TS-BGID-007]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T14:59:49Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Description
Captures treasury confirmation that cash collateral has been received and blocked for a partially-secured guarantee. Triggers an automated client notification containing the blocked amount, value date, and estimated issuance timeline, removing the TFO's manual collateral status relay from the process.

## Inputs and outputs
Inputs: treasury collateral-blocked event including blocked amount, value date, and guarantee reference. Outputs: client notification event, collateral status record appended to the application, issuance-proceed trigger.

## Boundaries
Does not perform collateral valuation or blocking — receives the treasury event. Outbound notification events are published and consumed by the portal or API gateway. Does not update facility utilisation post-issuance.

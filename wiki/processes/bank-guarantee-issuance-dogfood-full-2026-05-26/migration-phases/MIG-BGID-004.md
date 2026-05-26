---
id: MIG-BGID-004
type: migration-phase
section: migration-phases
title: Phase 4 — MT760 Acknowledgement Forwarding & Client Notification Path
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
phaseStatus: PLANNED
startQuarter: 2027 Q2
endQuarter: 2027 Q2
owner: Head of Trade Finance Engineering
delivers: [CAP-BGID-007, CAP-BGID-008]
dependsOn: [MIG-BGID-001, MIG-BGID-002]
provenance: {"Acceptance criteria": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Risks": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Scope": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Scope
Configures the TFS SWIFT Adapter to capture inbound MT760 acknowledgements and publish mt760-acknowledged notification events (INT-BGID-008). Activates the Portal Notification Service for client push delivery of all four notification types: wording decision, collateral confirmation, guarantee issued, and MT760 acknowledged. Implements the ICC-SWIFT API callback path for ERP-connected clients. Closes FP-BGID-004 (no client delivery confirmation). Only the acknowledgement capture and forwarding path changes — the core SWIFT processing chain is unchanged.

## Acceptance criteria
- Every issued guarantee triggers a client notification within 2 hours of MT760 acknowledgement receipt
- 100% of notification events delivered with zero events stranded in bgid.notifications.dlq over the first 30 days
- ERP-connected clients receive ICC-SWIFT API callbacks for all four notification types within 2 hours
- TFO manual delivery confirmation step removed from the operational process checklist

## Risks
- MT760 ACK message format variations across beneficiary banks may require additional SWIFT parser rules
- Portal SSE notification delivery under browser reconnections requires load-testing before go-live
- ERP client API callback endpoint availability is outside the bank's control — retry exhaustion must be monitored

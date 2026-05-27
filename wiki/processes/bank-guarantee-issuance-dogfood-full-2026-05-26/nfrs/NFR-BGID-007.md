---
id: NFR-BGID-007
type: nfr
section: nfrs
title: EU AI Act Conformity Assessment and CE Marking Before Go-Live
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
category: COMPLIANCE
target: Conformity assessment completed, CE declaration signed, and Article 11 technical documentation filed before any production inference run
owner: Chief Compliance Officer
appliesTo: [TGTAPP-BGID-002]
drivenByADR: [ADR-BGID-006]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Definition
The AI Wording Pre-Screener must complete its EU AI Act Annex III conformity assessment, obtain CE marking, and have Article 11 technical documentation — model card, training data record, performance metrics — in place before any inference runs in production.

## Measurement
Evidenced by the signed conformity assessment certificate and CE declaration of conformity, held in the bank's AI governance register. Article 11 documentation version-controlled in the Model Registry (COMP-BGID-006).

## Verification
Hard go/no-go gate for Phase 2 go-live: conformity assessment certificate and CE declaration must be signed off by the Chief Compliance Officer and filed before the Phase 2 go-live checklist is approved. Audited at each model update thereafter.

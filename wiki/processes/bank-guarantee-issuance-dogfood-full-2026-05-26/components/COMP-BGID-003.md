---
id: COMP-BGID-003
type: component
section: components
title: TFS SWIFT Adapter
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
tech: Finastra TI SWIFT module (Java) / SWIFT Alliance Gateway 7.x
dataStore: PostgreSQL 16 (MT760 message log)
hosting: Finastra on-prem cluster + SWIFT Alliance Gateway co-located, EU
scaling: Active-passive HA (SWIFT connectivity requires dedicated hardware)
inApp: [TGTAPP-BGID-001]
realisesCapability: [CAP-BGID-007]
provenance: {"Responsibility": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Technical detail": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Responsibility
Generates SWIFT MT760 guarantee instruments and dispatches them via SWIFT Alliance Gateway. Captures inbound MT760 acknowledgements from the beneficiary's bank and publishes an mt760-acknowledged notification event to bgid.notifications.v1.

## Technical detail
Finastra TI SWIFT module (Java, FusionFabric API) with SWIFT Alliance Gateway 7.x co-located on-prem. MT760 generated from TFS application record. Inbound SWIFT message parser filters for MT760 ACK and publishes mt760-acknowledged event. MT760 message log in PostgreSQL 16. Active-passive HA; dedicated SWIFT hardware.

---
id: NFR-BGID-009
type: nfr
section: nfrs
title: COREP C 07.00 Off-Balance-Sheet Reporting Feed by 18:00 CET Daily
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
category: COMPLIANCE
target: COREP C 07.00-compliant guarantee exposure feed delivered to regulatory reporting system by 18:00 CET each business day
owner: Chief Risk Officer
appliesTo: [TGTAPP-BGID-001]
regulatedBy: [REG-BGID-012]
provenance: {"Definition": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Measurement": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Verification": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Definition
The TFS must produce a COREP C 07.00-compliant off-balance-sheet exposure data feed covering all guarantees issued or expired on each business day, delivered to the bank's regulatory reporting system by 18:00 CET daily (REG-BGID-012).

## Measurement
Monitored via the regulatory reporting pipeline's job completion log. Daily feed delivery is timestamped; any breach of the 18:00 CET deadline triggers an operations alert and is logged for the quarterly supervisory reporting pack.

## Verification
Tested in UAT with a full month's simulated guarantee issuance data. Output validated against COREP C 07.00 schema by the bank's regulatory reporting team before Phase 1 go-live.

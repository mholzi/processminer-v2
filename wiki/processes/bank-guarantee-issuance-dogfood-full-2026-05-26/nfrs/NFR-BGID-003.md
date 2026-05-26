---
id: NFR-BGID-003
type: nfr
section: nfrs
title: TFS + SWIFT Path Availability 99.9% · RTO ≤ 1h · RPO ≤ 15min
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
category: AVAILABILITY
target: Monthly availability ≥ 99.9% (≤ 44 min downtime/month); RTO ≤ 1h; RPO ≤ 15min
owner: Head of Trade Finance Engineering
appliesTo: [TGTAPP-BGID-001]
regulatedBy: [REG-BGID-009]
provenance: {"Definition": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Measurement": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Verification": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Definition
Measures monthly availability of the TFS including the SWIFT Adapter. Monthly availability ≥ 99.9% (allows ≤ 44 minutes unplanned downtime per month). RTO ≤ 1 hour and RPO ≤ 15 minutes for all TFS application data, as required by DORA ICT resilience obligations (REG-BGID-009).

## Measurement
Synthetic health checks every 30s from external monitoring (Datadog). Monthly availability calculated as (total minutes − unplanned downtime minutes) / total minutes. RTO and RPO validated quarterly via scheduled DR drill.

## Verification
Two scheduled DR drills per year: failover to passive node, measure actual RTO and RPO against targets. Results reported to the Technology Risk Committee and included in the DORA ICT risk report.

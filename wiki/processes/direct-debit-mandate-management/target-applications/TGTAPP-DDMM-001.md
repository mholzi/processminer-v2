---
id: TGTAPP-DDMM-001
type: target-application
section: target-applications
title: Mandate Hub
status: draft
confidence: high
verdict: BUILD
vendor: Camunda 8 + Postgres
owningDomain: Payments · Mandate management
costBand: €420k build · €120k/yr run
provenance: {"Rationale": {"evidence": "", "source": "proposed"}, "Risks": {"evidence": "", "source": "proposed"}, "Tech stack": {"evidence": "", "source": "proposed"}}
---
## Rationale
Build is the only viable option: no group-wide mandate platform exists, and the regulator-required reconciliation cadence (every 24h) is impossible to support on the legacy spreadsheet workflow. Camunda 8 supplies the BPMN orchestration spine and matches our Postgres standard.

## Tech stack
Camunda 8 (Zeebe + Operate + Tasklist), Postgres 16 on RDS, self-hosted in eu-frankfurt. Spring Boot 3 service layer for case operations.

## Risks
- Vendor lock to Camunda 8 (BPMN export is round-trip safe, partial mitigation)
- 14 FTE-weeks build estimate carries schedule risk
- Camunda licence renewal in 2027 Q1 — needs commercial review before MIG-DDMM-002 cutover

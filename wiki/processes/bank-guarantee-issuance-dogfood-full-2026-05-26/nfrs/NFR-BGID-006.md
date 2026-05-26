---
id: NFR-BGID-006
type: nfr
section: nfrs
title: 10-Year WORM Audit Trail — Archive ≤ 30s · Regulator Response ≤ 2 BD
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
category: COMPLIANCE
target: Every lifecycle event archived to WORM storage within 30s of publication; retained 10 years; regulator query response within 2 business days
owner: Chief Compliance Officer
appliesTo: [TGTAPP-BGID-006]
drivenByADR: [ADR-BGID-011]
regulatedBy: [REG-BGID-011]
provenance: {"Definition": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Measurement": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Verification": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Definition
Every guarantee lifecycle event must be archived to WORM storage within 30 seconds of Kafka publication, retained immutably for 10 years with tamper-evident integrity, and accessible for regulator query response within 2 business days of request. Satisfies AML record-keeping obligations under AMLD5, AMLR, and MaRisk BTO 1.2 (REG-BGID-011).

## Measurement
Kafka consumer lag measured as archive latency p95 (Grafana). DMS object count reconciled nightly against TFS event count. Retention lock status audited annually by the compliance team.

## Verification
Verified in UAT by publishing 500 synthetic lifecycle events and confirming all 500 appear in WORM storage with correct retention lock within 60 seconds. Annual WORM lock audit in production by compliance team.

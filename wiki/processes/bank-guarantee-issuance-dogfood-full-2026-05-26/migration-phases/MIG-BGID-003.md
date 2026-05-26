---
id: MIG-BGID-003
type: migration-phase
section: migration-phases
title: Phase 3 — Facility Headroom Dashboard & Murex Integration
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
phaseStatus: PLANNED
startQuarter: 2027 Q1
endQuarter: 2027 Q1
owner: Head of Trade Finance Engineering
delivers: [CAP-BGID-005]
dependsOn: [MIG-BGID-001]
provenance: {"Acceptance criteria": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Risks": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Scope": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Scope
Delivers the real-time facility headroom widget on the Corporate Portal (INT-BGID-003: Portal → Murex sync read), the authoritative facility limit check in TFS processing (INT-BGID-004: TFS → Murex sync check), and the post-issuance utilisation write-back (INT-BGID-005: TFS → Murex async). Murex Facility Headroom Read API and Facility Utilisation Write Subscriber built and deployed by Murex Professional Services. Credit team escalation workflow is unchanged.

## Acceptance criteria
- Portal headroom widget P95 latency ≤ 1s under 50 concurrent users
- Post-issuance facility utilisation visible in Murex within 1 business day of guarantee issuance
- Zero auto-cleared applications where Murex limit check returned SHORTFALL
- Facility utilisation dead-letter queue depth zero over the first 30 days of operation

## Risks
- Murex Professional Services delivery timeline may extend beyond Q1-2027 if contractual engagement is delayed
- Murex MX.3 synchronous read API may require performance tuning under concurrent Portal and TFS load
- Async utilisation write staleness window may be wider than expected under concurrent issuance scenarios

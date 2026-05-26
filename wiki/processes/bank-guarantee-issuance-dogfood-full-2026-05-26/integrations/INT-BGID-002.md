---
id: INT-BGID-002
type: integration
section: integrations
title: Trade Finance System to Sanctions Screening Tool — Beneficiary Screening
status: draft
confidence: medium
source: it-architect session 2026-05-26
systems: [SYS-BGID-002, SYS-BGID-003]
provenance: {"What connects": {"evidence": "Elicited: synchronous API, SLA <2s, manual queue failover, confidential, PS-BGID-004", "source": "elicited"}, "What flows": {"evidence": "Elicited: beneficiary name/country/BIC, screening result, evidence record", "source": "elicited"}}
updatedBy: admin
updatedAt: 2026-05-26T10:09:43Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## What connects
Synchronous API from the Trade Finance System (SYS-BGID-002) to the Sanctions Screening Tool (SYS-BGID-003) at PS-BGID-004. SLA: <2s response; failover: manual screening queue; classification: confidential.

## What flows
- Beneficiary name, country, SWIFT BIC and application reference submitted for screening
- Screening result (clear / hit / pending investigation) with watchlist match detail
- Screening evidence record returned for attachment to the TFS application

---
id: ADR-BGID-010
type: adr
section: architecture-decisions
title: EU Data Residency for All Confidential Guarantee Data
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
adrStatus: ACCEPTED
owner: Domain Architect
domain: IT Architecture / Compliance
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T14:59:49Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Context
Bank guarantee applications contain confidential client data — party identities, financial positions, commercial contract references — subject to GDPR Article 44 restrictions on international data transfers. AI model training ingests guarantee wording; SWIFT routing passes message payloads through global infrastructure. The bank must set a blanket data-residency policy for all transformation components.

## Decision
All confidential guarantee data — application records, SWIFT message payloads, AI wording inputs for training and inference, compliance screening inputs and outputs, and archival records — must be processed and stored on EU-hosted infrastructure only. No data transfer to non-EU processors without executed DPAs with Standard Contractual Clauses.

## Alternatives considered
- **Global cloud with US disaster-recovery regions** — rejected: GDPR cross-border transfer restrictions and the bank's internal confidential-data policy prohibit non-EU processing absent SCCs; US CLOUD Act conflict with GDPR is an accepted legal risk the bank will not carry
- **Full on-premises only** — rejected: overly restrictive; EU-hosted cloud is GDPR-compliant and operationally preferred for scalable AI inference
- **Case-by-case residency assessment per vendor** — rejected: fragmented governance creates audit gaps; a blanket EU-only rule for confidential data is simpler to audit and enforce

## Consequences
- AI Wording Pre-Screener training and inference must run on EU-hosted GPU infrastructure
- Refinitiv World-Check integration must be confirmed to use EU data endpoints
- MLETR-ready delivery channel must use EU-anchored qualified trust services
- All SaaS vendors in the solution stack require a valid DPA with EU SCCs before go-live

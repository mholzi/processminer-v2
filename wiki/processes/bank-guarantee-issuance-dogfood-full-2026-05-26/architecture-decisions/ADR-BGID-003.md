---
id: ADR-BGID-003
type: adr
section: architecture-decisions
title: ICC-SWIFT API as Primary Corporate Channel Standard
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
adrStatus: ACCEPTED
owner: Domain Architect
domain: Trade Finance / Digital Channels
decision: [TD-BGID-001]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T14:59:49Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Context
ERP-connected corporate clients cannot submit guarantee applications via the portal without rekeying data from their ERP system. TD-BGID-001 mandates an API channel for this segment. The bank must choose the API standard — proprietary, SWIFT MT-798, ICC-SWIFT, or EBICS 3.0. The choice determines interoperability with the market and the bank's positioning for multi-bank electronic guarantee networks emerging under MLETR and eIDAS 2.0 trends.

## Decision
Adopt the ICC-SWIFT API standard as the corporate channel, embedded as an extension of the existing Corporate Portal backend with a dedicated ICC-SWIFT adapter module.

## Alternatives considered
- **Proprietary REST API with bank-defined schema** — rejected: no standard MT760 mapping; each ERP client requires bespoke integration; blocks multi-bank interoperability
- **SWIFT MT-798 messaging only** — rejected: cannot carry structured application data or mandatory field enforcement; no real-time acknowledgement return path
- **EBICS 3.0** — rejected: established for EU payment transactions, not trade-finance guarantee applications; not aligned with ICC/SWIFT direction for demand guarantees

## Consequences
- Alignment with ICC digital trade standards and multi-bank network direction
- SWIFT API certification timeline adds programme overhead
- Per-corporate ERP onboarding and integration testing required at adoption
- Positions the bank for future multi-bank electronic guarantee exchange networks

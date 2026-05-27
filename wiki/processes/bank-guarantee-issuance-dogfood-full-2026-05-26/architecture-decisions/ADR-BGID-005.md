---
id: ADR-BGID-005
type: adr
section: architecture-decisions
title: Retain Refinitiv World-Check for Sanctions Screening
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
adrStatus: ACCEPTED
owner: Domain Architect
domain: Compliance & Risk
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T14:59:49Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Context
The bank uses Refinitiv World-Check for AML and sanctions screening across multiple transaction types. TS-BGID-004 confirms no change to the screening step in this transformation. The bank must decide whether to keep World-Check through the transformation or use the programme as a trigger for a wider sanctions-platform re-evaluation.

## Decision
Retain Refinitiv World-Check for the duration of this transformation. No platform evaluation or migration activity is in-scope for this programme.

## Alternatives considered
- **Migrate to Dow Jones Risk & Compliance** — rejected: migration during an active transformation introduces dual-running cost and re-certification risk with no documented compliance gap in World-Check
- **Build in-house list-matching** — rejected: regulatory list maintenance is high-effort and outside the bank's core competency; calibration risk under AMLD5 and AMLR
- **Evaluate alternatives at next contract renewal** — adopted as a separate initiative: the right timing for a platform review is the World-Check contract renewal cycle, not within this transformation scope

## Consequences
- Vendor dependency on LSEG for sanctions list completeness and accuracy
- Contract renewal risk and potential pricing pressure
- Any future migration requires a separate programme with its own regulatory continuity plan

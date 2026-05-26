---
id: TGTAPP-BGID-003
type: target-application
section: target-applications
title: Sanctions Screening Platform (Refinitiv World-Check)
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
verdict: KEEP
vendor: LSEG / Refinitiv World-Check
owningDomain: Compliance & Risk
costBand: €150k–300k annual licence (existing)
drivenByADR: [ADR-BGID-005]
provenance: {"Rationale": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Risks": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}, "Tech stack": {"evidence": "Markus Holzhäuser, Domain Architect — batch review session 2026-05-26", "source": "elicited"}}
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T14:59:49Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Rationale
Refinitiv World-Check is the bank's incumbent sanctions and AML screening platform, already satisfying AMLD5 and AMLR obligations across all transaction types. A vendor swap during an active transformation would introduce dual-running cost, re-certification risk, and regulatory continuity concern with no documented compliance improvement. The transformation confirms no change to the screening step.

## Tech stack
Refinitiv World-Check One with EU data residency option, API integration to TFS for automated screening triggers, manual review interface for flagged cases.

## Risks
- LSEG pricing and contract renewal risk — no competitive pressure during this transformation window
- EU data residency must be confirmed at Refinitiv's EU endpoints for GDPR compliance
- List-matching recall is subject to Refinitiv's list coverage — any gap is a residual regulatory risk

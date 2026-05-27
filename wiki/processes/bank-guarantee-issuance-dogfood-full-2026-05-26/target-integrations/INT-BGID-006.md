---
id: INT-BGID-006
type: target-integration
section: target-integrations
title: TFS → Refinitiv World-Check: Sanctions Screening
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
pattern: SYNC
direction: BIDIRECTIONAL
contract: Refinitiv World-Check One API v2 REST — POST /v2/cases/search
volume: ~700 req/month (applicant + beneficiary) · P95 ≤ 3s
from: [TGTAPP-BGID-001]
to: [TGTAPP-BGID-003]
realises: [CAP-BGID-004]
drivenByADR: [ADR-BGID-005]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Purpose
For each guarantee application, the TFS screens the applicant and the beneficiary against global sanctions lists and AML watchlists via Refinitiv World-Check One. The response routes the application to clear or manual Compliance review, satisfying AMLD5, AMLR, and EU Sanctions Regulation obligations.

## Contract details
Refinitiv World-Check One API v2 REST, POST /v2/cases/search. Auth: API key in HTTPS header, managed in HashiCorp Vault. Request: entityType, partyName, dateOfBirth or registrationDate, jurisdiction. Response: caseStatus, matchScore, matchList. EU endpoint: api.wc.eu.refinitiv.com. TLS 1.3. Timeout 10s.

## Failure mode
If World-Check is unavailable, TFS quarantines the application and alerts Compliance for manual screening. No application advances to issuance approval without a successful screening result. API SLA non-compliance triggers the vendor escalation procedure in the BCP.

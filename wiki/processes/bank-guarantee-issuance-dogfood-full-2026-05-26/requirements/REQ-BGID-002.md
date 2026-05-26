---
id: REQ-BGID-002
type: requirement
section: requirements
title: Wording Pre-Screener Must Classify and Route Standard Wording Without Legal Queue Entry
status: draft
confidence: high
source: SME interview — transformation-agent session 2026-05-26
reqType: FUNCTIONAL
moscow: MUST
derivedFrom: [TD-BGID-002]
addresses: []
provenance: {"Acceptance criteria": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}, "Rationale": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}, "Requirement": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}}
updatedBy: admin
updatedAt: 2026-05-26T09:28:32Z
---
## Requirement
The AI wording pre-screener must classify guarantee wording as standard or bespoke within one business day of submission and route standard-classified wording directly to the credit and facility check without entering Legal's review queue.

## Rationale
The business case for TD-BGID-002 depends on Legal's workload reduction on standard cases; a pre-screener that still routes all wording through Legal does not deliver the committed SLA or the cycle-time reduction that justifies the investment.

## Acceptance criteria
- Every standard-classified wording advances to the credit check without a Legal queue entry, confirmed by TFS workflow audit
- Time to classification is no greater than one business day for all submitted wording texts
- A bespoke-classified wording triggers a Legal review task with the SLA clock started and the client notified within one business day of classification

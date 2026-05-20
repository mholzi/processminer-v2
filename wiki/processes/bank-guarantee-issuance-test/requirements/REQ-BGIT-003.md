---
id: REQ-BGIT-003
type: requirement
section: requirements
title: In-TFS Legal workflow enforces configurable SLA timer with automatic escalation
status: draft
confidence: low
source: source-target — bank-guarantee-issuance-test wiki
reqType: FUNCTIONAL
moscow: MUST
derivedFrom: [TD-BGIT-003]
addresses: [PP-BGIT-002, PG-BGIT-002, PG-BGIT-003]
provenance: {"Acceptance criteria": {"evidence": "", "source": "proposed"}, "Rationale": {"evidence": "", "source": "proposed"}, "Requirement": {"evidence": "", "source": "proposed"}}
---
## Requirement
The in-TFS Legal wording workflow must record routing timestamps, enforce a configurable SLA timer, send an automated reminder at 80% of SLA consumed, and trigger an escalation notification to Head of Legal at SLA breach.

## Rationale
SLA enforcement is the mechanism that closes PG-BGIT-003; without a monitored timer, an in-system workflow improves visibility but does not deliver the process predictability the transformation targets.

## Acceptance criteria
- Legal review routing timestamp is recorded in TFS at the moment the TFO routes the bespoke case
- SLA timer is configurable per wording complexity category with a minimum of two tiers
- Escalation notification reaches Head of Legal within 15 minutes of SLA breach

---
id: ASM-BGIT-002
type: assumption
section: assumptions
title: Trade Finance System supports configurable SLA workflow timers without a major platform upgrade
status: draft
confidence: low
source: source-target — bank-guarantee-issuance-test wiki
assumptionStatus: OPEN
bearsOn: [TD-BGIT-003]
---
## The assumption
The in-TFS Legal wording workflow requires the Trade Finance System to support configurable SLA timers, automated notification dispatch and escalation routing natively, without requiring a major platform version upgrade.

## Why it is unconfirmed
The TFS platform's workflow configuration capabilities have not been formally scoped against the Legal workflow requirements. A platform gap requiring a version upgrade or third-party integration would materially increase the complexity and cost of TD-3.

## Impact if wrong
If the TFS cannot support SLA timers natively, the Legal workflow requires a middleware layer or platform upgrade, increasing complexity from MEDIUM to HIGH and potentially delaying the wording workflow delivery.

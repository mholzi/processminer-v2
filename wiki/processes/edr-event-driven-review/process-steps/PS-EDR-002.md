---
id: PS-EDR-002
type: process-step
section: process-steps
title: Initial assessment
status: draft
confidence: high
source: event-driven-review.md
owner: Financial Crime Analyst (1LoD)
condition: EDR case has been opened
transitions: [PS-EDR-003|branch|CDD refresh needed, PS-EDR-007|branch|enhanced monitoring only — record decision and set 90-day review flag]
systems: [SYS-EDR-001]
provenance: {"Inputs": {"evidence": "the Analyst reviews the event in context: transaction history, prior alerts, current risk rating, time since last KYC refresh", "source": "document"}, "Outputs": {"evidence": "They decide whether a full CDD refresh is needed or whether enhanced monitoring alone is sufficient. If enhanced monitoring only → record decision, set 90-day review flag, close the case.", "source": "document"}, "What happens": {"evidence": "Within 2 business days the Analyst reviews the event in context: transaction history, prior alerts, current risk rating, time since last KYC refresh. They decide whether a full CDD refresh is needed or whether enhanced monitoring alone is sufficient. If enhanced monitoring only → record decision, set 90-day review flag, close the case.", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
---
## What happens
Within 2 business days the Analyst reviews the event in context: transaction history, prior alerts, current risk rating, and time since last KYC refresh. They decide whether a full CDD refresh is needed or whether enhanced monitoring alone is sufficient. If enhanced monitoring only, the decision is recorded, a 90-day review flag is set, and the case is closed.

## Inputs
- Opened EDR case
- Transaction history
- Prior alerts
- Current risk rating
- Date of last KYC refresh

## Outputs
- Decision on CDD refresh requirement
- If enhanced monitoring only: 90-day review flag set; case closed

## Why it matters
Proportionate triage prevents unnecessary CDD refresh requests on low-risk events while ensuring material events receive full due diligence scrutiny.

---
id: FP-DDMM-004
type: friction-point
section: friction-points
title: Passive R-Transaction Notification
status: draft
confidence: high
source: ddmm-client-journey-specialist
severity: MEDIUM
occursAt: [PS-DDMM-007]
---
## Description
When an R-transaction on a mandate is resolved, the portal posts a notification for MD01, MD02, and AC04 reason codes. The notification is portal-only — no email or push — requiring the creditor to log in to discover it.

## Root cause
The Creditor Portal was not designed with proactive outbound notification capability; all communication is in-portal, relying on the creditor to check for updates rather than pushing alerts to them.

## Client impact
A creditor who does not proactively log in may be unaware of the resolution for days, delaying follow-up action such as correcting debtor details or rescheduling a collection. Repeated R-transactions may go unnoticed until a collection failure reveals the pattern.

---
id: TS-BGID-007
type: target-state
section: to-be-design
title: Collateral Confirmation with Automated Client Notification
status: draft
confidence: high
source: SME interview — transformation-agent session 2026-05-26
replaces: [PS-BGID-007]
systems: []
updatedBy: admin
updatedAt: 2026-05-26T09:27:02Z
---
## Target description
When the treasury team blocks cash collateral for a partially-secured guarantee, an automated notification is sent to the client confirming the collateral has been received and blocked and that guarantee release is proceeding. The client no longer needs to contact the trade-finance desk to determine collateral and release status.

## What changes
- An automated notification is triggered to the client when treasury confirms collateral has been received and blocked
- The notification includes the blocked amount, value date and estimated issuance timeline
- The TFO's role in manually relaying collateral confirmation to the client is removed from the process

## Rationale
A notification at collateral blocking closes FP-BGID-003 with minimal operational change; the trigger event is already a discrete treasury action, making automation straightforward and requiring no structural process redesign.

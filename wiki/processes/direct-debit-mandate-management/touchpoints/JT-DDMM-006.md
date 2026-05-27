---
id: JT-DDMM-006
type: cx-touchpoint
section: touchpoints
title: Receive R-Transaction Resolution Notification
status: draft
confidence: high
source: ddmm-client-journey-specialist
channel: CH-DDMM-001
occursAt: [PS-DDMM-007]
---
## What the client does
The creditor logs into the Creditor Portal to read an R-transaction resolution notification for one of their mandates, then determines and takes the required follow-up action.

## What the bank does
The Mandate Clerk posts a resolution notification in the portal for MD01, MD02, and AC04 R-transactions; SL01 generates no notification and the creditor is not informed of the restriction.

## Experience
The notification is passive — portal only, no push or email — so a creditor who does not log in proactively may miss it. When seen, it closes the R-transaction loop but provides no proactive alert that the mandate's collection reliability is at risk.

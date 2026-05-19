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
provenance: {"Experience": {"evidence": "SME confirmed: notification is portal-only, no push or email; creditor who does not proactively log in may miss it. SME accepted framing that repeated R-transactions can signal deteriorating collection relationship with no proactive alert.", "source": "elicited"}, "What the bank does": {"evidence": "SME confirmed: Mandate Clerk posts resolution notification in portal for MD01/MD02/AC04; SL01 generates no notification — creditor not informed of restriction.", "source": "elicited"}, "What the client does": {"evidence": "SME (M. Vogel): portal notification appears for MD01/MD02/AC04; creditor must log in to see it; SL01 generates no notification.", "source": "elicited"}}
---
## What the client does
The creditor logs into the Creditor Portal to read an R-transaction resolution notification for one of their mandates, then determines and takes the required follow-up action.

## What the bank does
The Mandate Clerk posts a resolution notification in the portal for MD01, MD02, and AC04 R-transactions; SL01 generates no notification and the creditor is not informed of the restriction.

## Experience
The notification is passive — portal only, no push or email — so a creditor who does not log in proactively may miss it. When seen, it closes the R-transaction loop but provides no proactive alert that the mandate's collection reliability is at risk.

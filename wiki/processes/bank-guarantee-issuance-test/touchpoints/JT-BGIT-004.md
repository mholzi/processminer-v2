---
id: JT-BGIT-004
type: cx-touchpoint
section: touchpoints
title: SWIFT MT760 delivery to beneficiary's bank
status: draft
confidence: high
source: client-journey-specialist — M. Berger, 2026-05-20
channel: SWIFT
occursAt: [PS-BGIT-006]
provenance: {"Experience": {"evidence": "M. Berger: delivery confirmation is indirect — client learns via portal or RM callback, not real-time notification", "source": "elicited"}, "What the bank does": {"evidence": "M. Berger confirmed TFO generates and dispatches guarantee via SWIFT at Step 6, updates TFS facility record", "source": "elicited"}, "What the client does": {"evidence": "M. Berger: 'SWIFT MT760 receipt at beneficiary's bank' confirmed as final delivery touchpoint", "source": "elicited"}}
---
## What the client does
The client does not receive the SWIFT message directly — the instrument goes to the beneficiary's bank. The client learns of dispatch via the portal or an RM callback.

## What the bank does
The TFO generates the guarantee in TFS and dispatches it via SWIFT MT760; the facility utilisation record is updated to reflect the new outstanding exposure.

## Experience
Delivery notification is indirect and potentially delayed. There is no real-time push notification to the corporate applicant on SWIFT dispatch, creating uncertainty about whether the beneficiary received the instrument in time for their commercial deadline.

---
id: MT-PR-005
type: moment
section: moments
title: Decision notification
status: draft
confidence: medium
source: periodic-kyc-review-dtp.pdf
sentiment: positive
touchpoint: []
---
## The moment
When the review is approved, the client receives a push notification confirming the outcome. For cases where the client was asked to provide information, this closes the loop on the interaction they participated in.

## Why it matters
The As-Is friction was a silent close: the bank reached a decision and the client received no acknowledgement. The push notification converts the end of the review from a non-event into an explicit, positive confirmation.

## Design implication
The close-out step must trigger the Outreach Service to send the push notification. Notifications should only fire for clients who were contacted; silent STP completions do not require a notification unless the client has opted in to review confirmations.

---
id: MT-PR-004
type: moment
section: moments
title: KYC status visibility
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
sentiment: positive
touchpoint: []
provenance: {"Design implication": {"evidence": "", "source": "proposed"}, "The moment": {"evidence": "'Your KYC is up to date until 14 Aug 2029.' (§6.2 table, row 'Status visibility', column 'What the client experiences'); No silence. The client sees their KYC status and next review date in the app at all times. (§6.1 Principle 5)", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
---
## The moment
At any point the client can open the app and see: "Your KYC is up to date until 14 Aug 2029." The next review date and current status are always visible, without any action required.

## Why it matters
In the As-Is state clients had no visibility of KYC status and learned they were due only when the bank contacted them — gap G-09. The target moment replaces opacity with transparency; the client can self-serve their compliance posture via the app at any time.

## Design implication
The Case Manager must write the next review date and risk rating back to Core Banking and expose it via the mobile app in real time. The status display must update immediately on close-out, not on a nightly batch.

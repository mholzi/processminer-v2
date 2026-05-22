---
id: MT-PR-002
type: moment
section: moments
title: Outreach when needed
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
sentiment: negative
touchpoint: []
provenance: {"Design implication": {"evidence": "", "source": "proposed"}, "The moment": {"evidence": "One in-app prompt: 'Quick KYC check — 2 minutes.' (§6.2 table, row 'Outreach (when needed)', column 'What the client experiences')", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
---
## The moment
When the bank cannot complete the review from data it already holds, the client receives a single in-app prompt: "Quick KYC check — 2 minutes." This is the one permitted interruption in the target process.

## Why it matters
The old friction was severe: email, paper form, scan, return trip to the branch. The target moment remains a negative one but the CX principle "One thread, one ask" ensures all requests are consolidated into a single interaction, not multiple contacts.

## Design implication
Outreach must only fire when genuinely necessary and must never repeat. The Outreach Service must carry a de-duplication guard, and the prompt copy must state the regulatory reason in plain language (CX principle 3: "Be honest about why").

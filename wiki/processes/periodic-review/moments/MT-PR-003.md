---
id: MT-PR-003
type: moment
section: moments
title: Information request
status: draft
confidence: medium
source: periodic-kyc-review-dtp.pdf
sentiment: negative
touchpoint: []
provenance: {"Design implication": {"evidence": "", "source": "proposed"}, "The moment": {"evidence": "", "source": "proposed"}, "Why it matters": {"evidence": "Re-uploading the ID the bank already holds (§6.2 table, row 'Information request', column 'Friction we removed')", "source": "document"}}
---
## The moment
When the client opens the outreach prompt, they see a pre-filled form with data the bank already holds. Only the delta — what has changed or is genuinely missing — is requested.

## Why it matters
The old friction was re-uploading an ID document the bank already held. That friction is removed in the target state, where the pre-fill makes the bank's existing knowledge visible to the client and the residual ask is demonstrably minimal.

## Design implication
The pre-fill completeness threshold must be high enough that the residual ask is truly small. The Document Vault integration must surface current documents into the outreach form so the client can confirm rather than re-upload.

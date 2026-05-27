---
id: II-BGID-003
type: innovation-idea
section: innovation-ideas
title: ISO 20022 guarantee message early migration
status: draft
confidence: high
category: platform
strategicFit: MEDIUM
complexity: HIGH
addresses: [PG-BGID-001]
fromTrend: [TR-BGID-002]
updatedBy: the assistant
updatedAt: 2026-05-26T20:02:52Z
---
## The idea
Migrate PS-BGID-006 SWIFT delivery to ISO 20022 ahead of the November 2027 cut-over and use the structured payload to drive downstream reconciliation, facility utilisation updates, and amendment workflows.

## Expected benefit
Avoids the 2027 hard-cut crunch, surfaces structured wording fields for ML/automation downstream, and reduces SWIFT NAK volume by validating against the schema before send.

## Feasibility
Requires Murex MX.3 / TFS upgrades and beneficiary-bank ISO 20022 readiness on the receiving side. Significant; tracks the bank-wide ISO 20022 programme. 3+ quarters in coordination with payments.

---
id: TD-BGIT-002
type: transformation-decision
section: transformation-decisions
title: Deploy real-time credit limit advisory on Corporate Portal at application submission
status: draft
confidence: high
source: source-target — bank-guarantee-issuance-test wiki
decisionType: build/buy
decisionStatus: agreed
resolves: [PP-BGIT-001, PG-BGIT-001]
realises: [TS-BGIT-001]
fromIdea: [II-BGIT-003]
---
## The decision
Build a read-only credit limit advisory widget on the Corporate Portal that queries the Trade Finance System in real time at the point of application and displays current facility utilisation and available headroom to the client before submission.

## Options considered
- Display real-time credit headroom from TFS on the portal at submission point
- Send an automated pre-submission warning email when limit looks insufficient
- Require Credit team pre-approval before portal access for clients near their limit
- Accept the status quo and rely on Credit team referral at Step 2

## Rationale
A portal-level advisory removes the information asymmetry that causes clients to submit applications they could have known would trigger a Credit team referral. It requires only a read-only TFS API query with no process or control changes, making it the lowest-complexity path to reducing the most common source of delay.

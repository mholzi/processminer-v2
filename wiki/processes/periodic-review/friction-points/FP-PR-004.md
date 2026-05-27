---
id: FP-PR-004
type: friction-point
section: friction-points
title: No KYC status visibility between reviews
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
severity: MEDIUM
occursAt: [MT-PR-004]
painPoint: [PP-PR-001]
addressedBy: [PS-PR-007]
---
## Description
Between review cycles, clients have no KYC status visibility — complete, pending, or due — and cannot see their next review date. They discover the outcome only at the next outreach contact. The document records this as 'No visibility; clients found out at next outreach.'

## Root cause
The As-Is process writes outcomes only to internal systems (SharePoint and core banking) with no client-facing status channel. The gap is formally recorded as 'Client visibility of KYC status absent' (G-09, severity Low, target close Q3 2027).

## Client impact
The lack of any status signal leaves clients uncertain about a legally significant obligation. When the next outreach arrives, they are surprised rather than informed. The target state resolves this by surfacing KYC status and review date in the mobile app (Principle 5).

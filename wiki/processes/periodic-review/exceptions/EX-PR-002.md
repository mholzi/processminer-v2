---
id: EX-PR-002
type: exception
section: exceptions
title: Exit recommendation requiring FCO sign-off
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
category: exit-referral
impact: HIGH
handlingOwner: Financial Crime Officer
---
## Description
When the FCO Analyst's triage at Step 5 produces a "Recommend exit" decision, the case departs the normal approval path and escalates to the Financial Crime Officer for 4-eyes sign-off at Step 6. This is one of the mandatory escalation triggers alongside High-risk clients and PEPs.

## Handling
The case is routed to Step 6 (Sign-off) where the Financial Crime Officer applies the 4-eyes principle. Sign-off is recorded against the FCO's identity (SSO) and is immutable in the Audit Ledger. On FCO approval of the exit recommendation, the Case Manager opens the Client Exit workflow and notifies Customer Communications to draft the regulatory-compliant exit letter.

## Impact
An exit referral extends the case lifecycle through FCO review and the Client Exit workflow. It carries the highest compliance sensitivity: an exit without proper sign-off constitutes a control failure under the 4-eyes requirement (KYC-C-03).

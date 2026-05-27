---
id: PS-PR-001
type: process-step
section: process-steps
title: Trigger
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
owner: KYC Trigger Engine
sla:
condition:
systems: [SYS-PR-002]
---
## What happens
The KYC Trigger Engine evaluates every client in scope on a continuous basis and fires a ReviewDue event when any trigger condition is met. Triggers are deterministic and logged. A review fires when the client's review cadence expires (Low 5y / Medium 3y / High 1y), when an event-based trigger fires (sanctions/PEP hit, adverse-media match above threshold, transaction-monitoring closure with RECHECK_KYC recommendation, or confirmed beneficial-owner change), or when a regulatory request mandates a refresh. If not picked up within 72 hours the Case Manager auto-opens the case and notifies the queue owner.

## Inputs
- Client master record (identity, risk rating, next-review date)
- Last-review date from client master
- Risk rating from Risk Rating Service
- Event bus signals (sanctions hit, adverse-media flag, transaction-monitoring escalation, beneficial-owner change)

## Outputs
- ReviewDue event with reason code (cadence expiry, sanctions hit, adverse-media, BO change, regulatory request)
- Completeness score and STP eligibility flag assigned to the case

## Why it matters
A deterministic, rule-driven trigger eliminates the As-Is dependency on an RM remembering a review date and closes the critical gap that caused 18.4% of High-risk reviews to be overdue as of Q1 2026.

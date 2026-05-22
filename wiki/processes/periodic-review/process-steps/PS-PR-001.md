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
provenance: {"Inputs":{"source":"document","evidence":"Client master, last-review date, risk rating, event bus (sanctions, adverse media, transaction-monitoring, BO change)."},"Outputs":{"source":"document","evidence":"Output. ReviewDue event with reason code."},"What happens":{"source":"document","evidence":"Triggers are deterministic and logged. A review fires when any of: The client's review cadence expires (Low 5y / Med 3y / High 1y). An event-based trigger fires: a sanctions/PEP hit, an adverse-media match above threshold, a transaction-monitoring case closure with recommendation RECHECK_KYC, or a confirmed beneficial-owner change. A ReviewDue event never silently expires. If it is not picked up within 72 hours, the Case Manager auto-opens the case and notifies the queue owner."},"Why it matters":{"source":"document","evidence":"Reviews are triggered automatically by a central trigger engine — never by an RM remembering a date."}}
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

---
id: PR
type: process
section: overview
title: Periodic Review
status: draft
description: Recurring re-verification of a client's identity, beneficial ownership, source of wealth, and risk classification, executed on a cadence determined by the client's risk rating.
sources: [periodic-kyc-review-dtp.pdf]
confidence: high
source: periodic-kyc-review-dtp.pdf
processOwner:
trigger: A ReviewDue event emitted by the KYC Trigger Engine, fired when a client's risk-rating cadence expires (Low 5y / Medium 3y / High 1y) or an event occurs (sanctions hit, adverse-media flag, transaction-monitoring escalation, or confirmed beneficial-owner change).
frequency: Continuous — individual reviews fire on a 1-year (High-risk), 3-year (Medium-risk), or 5-year (Low-risk) cadence, plus event-triggered re-verifications.
scopeIn: All natural-person clients of Retail Banking and Private Banking Switzerland, EU and UK booking centres. All legal-entity clients up to and including the SME segment (≤ CHF 50 m balance-sheet total). Recurring re-verification on the risk-rating-driven cycle and event-triggered re-verification.
scopeOut: Onboarding KYC (covered by the Client Onboarding process). Correspondent banking due diligence (separate process, RBC-CDD). Ad-hoc Enhanced Due Diligence triggered by Financial Crime investigations, handled by the FIU under a different SLA framework.
processInput: ReviewDue event with reason code, emitted by the Trigger Engine from the client master, last-review date, risk rating, and event bus.
processOutput: On approval: risk rating refreshed, next-review date written to the client master, audit ledger entry sealed. On exit/restriction: Client Exit workflow opened or product/channel restrictions applied.
docStatus: As-Is draft
---
To re-verify client identity, beneficial ownership, source of wealth, and risk classification on a risk-rating-driven cadence, satisfying ongoing customer due diligence obligations under AMLD6, AMLO-FINMA, and FATF Recommendation 10. The process ensures that every review is triggered deterministically, executed with minimal client friction, and closed with a machine-readable, immutable audit record.

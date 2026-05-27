---
id: IR-BGID-003
type: innovation-risk
section: innovation-risks
title: ISO 20022 migration de-syncs with beneficiary-bank readiness
status: draft
confidence: high
severity: MEDIUM
updatedBy: the assistant
updatedAt: 2026-05-26T20:02:52Z
---
## The risk
Early migration to ISO 20022 guarantee messages (II-BGID-003) outpaces the beneficiary banks the corporate clients designate, increasing NAK volume on PS-BGID-006 delivery.

## Likelihood & impact
Likely in 2026 for non-tier-1 beneficiary banks; impact is operational rather than regulatory — delivery delays and rework on the SWIFT step.

## Mitigation
Track beneficiary-bank ISO 20022 readiness in the routing table; fall back to MT760 for non-ready receivers until cut-over; phase the migration by beneficiary-bank tier.

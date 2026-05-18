---
id: IR-FR-002
type: innovation-risk
section: innovation-risks
title: Over-reservation drags liquidity
status: draft
confidence: medium
source: SME interview - M. Berger
severity: MEDIUM
---
## The risk
Reserve-on-approval (II-FR-001) ring-fences funding and facility-limit headroom the moment a release is approved. If the rule that releases or restores a reservation for a cancelled, rejected or stalled item is weak, reserved funds and limit sit idle, shrinking the liquidity and credit headroom genuinely available to other releases.

## Likelihood & impact
Likelihood medium — cancellations, rejections and deferrals are routine. Impact medium: over-reservation does not lose money but throttles throughput, and a poorly tuned earmark could defer releases that funding would in fact have covered.

## Mitigation
Define a precise release-or-restore rule covering every terminal and stalled state, with an automatic time-out that frees a reservation if an item does not progress; monitor reserved-but-unposted volume as a tuning metric.

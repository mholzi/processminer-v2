---
id: IR-FR-004
type: innovation-risk
section: innovation-risks
title: STP control layer erodes the STP value proposition
status: draft
confidence: medium
source: SME interview - M. Berger
severity: MEDIUM
---
## The risk
The STP automated-control layer (II-FR-008) adds real-time rules validation and an anomaly-hold to the straight-through rail. If the rules are slow or the hold thresholds too aggressive, STP items are delayed or needlessly pulled back for human review, undermining the 2-hour turnaround the STP path exists to deliver.

## Likelihood & impact
Likelihood medium — control tuning is hard to get right first time. Impact medium: an over-tight layer pushes clean volume back onto the manual path and analyst bench, eroding the efficiency gain without losing safety.

## Mitigation
Tune anomaly-hold thresholds against a measured false-positive budget; run the control in monitor-only mode before it can hold items; and track STP turnaround (M-FR-001) so latency regression is visible immediately.

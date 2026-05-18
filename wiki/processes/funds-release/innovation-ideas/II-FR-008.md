---
id: II-FR-008
type: innovation-idea
section: innovation-ideas
title: STP automated-control layer
status: draft
confidence: medium
source: SME interview - M. Berger
category: Controls
strategicFit: HIGH
complexity: HIGH
addresses: [CG-FR-001, PG-FR-005]
fromTrend: [TR-FR-004]
fromCompetitor: [CGL-FR-002, CGL-FR-003]
---
## The idea
Add an automated-control layer to the STP rail: real-time rules-based release validation on every straight-through item, post-release monitored sampling of executed STP releases, and an anomaly-hold that pulls a suspect STP release back for human review before or shortly after posting. It is the compensating control for STP items that receive no human dual-control today.

## Expected benefit
STP releases gain a genuine, continuously-monitored control in place of the system-applied approval that no human sees today, closing the CG-FR-001 4-eyes coverage gap and meeting the supervisory expectation that automated rails carry automated, monitored controls.

## Feasibility
High effort and high risk — it needs a real-time rules engine, a sampling-and-monitoring capability and a defined anomaly taxonomy with hold thresholds. It depends on II-FR-003 documenting the STP path first; the bank would be early, with little peer precedent to copy.

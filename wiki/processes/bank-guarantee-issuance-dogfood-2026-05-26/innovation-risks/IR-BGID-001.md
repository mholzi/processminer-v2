---
id: IR-BGID-001
type: innovation-risk
section: innovation-risks
title: AI wording classifier mis-classifies a bespoke clause as standard
status: draft
confidence: medium
severity: HIGH
updatedBy: the assistant
updatedAt: 2026-05-26T20:02:52Z
---
## The risk
The AI pre-classifier (II-BGID-002) labels an application as standard-template when its wording contains a subtle but consequential bespoke clause, routing it past Legal and onto the fast lane.

## Likelihood & impact
Without explainability and a confidence threshold, mis-classifications will happen. Impact is high: an unintended legal obligation issued to a beneficiary, with regulatory and counterparty consequences.

## Mitigation
Run the model in shadow mode for two quarters; require human override on low-confidence scores; sample-audit 5% of approved standard-path cases monthly; track precision/recall against legal-reviewed ground truth.

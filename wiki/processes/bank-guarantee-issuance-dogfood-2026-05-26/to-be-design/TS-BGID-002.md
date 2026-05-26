---
id: TS-BGID-002
type: target-state
section: to-be-design
title: AI-Augmented Wording Review
status: draft
confidence: low
source: wiki-synthesis-2026-05-26
replaces: [PS-BGID-003]
systems: [SYS-BGID-002]
risks: [IR-BGID-001, IR-BGID-002]
provenance: {"Rationale": {"evidence": "", "source": "proposed"}, "Target description": {"evidence": "", "source": "proposed"}, "What changes": {"evidence": "", "source": "proposed"}}
updatedBy: admin
updatedAt: 2026-05-26T20:15:01Z
---
## Target description
An AI wording pre-classifier at intake scores each application's guarantee text against the bank's standard-template library and flags bespoke clauses before the application reaches Legal. Applications the classifier marks as standard-template proceed to the fast lane; genuinely bespoke cases reach Legal pre-annotated with flagged clause risks, shortening Legal review time. A formal 2-business-day Legal SLA and a maintained pre-approved clause library underpin the classifier's accuracy and accountability.

## What changes
- An AI wording pre-classifier is deployed at intake and runs in shadow mode for two quarters before live routing is enabled.
- Applications classified as standard-template skip Legal review and proceed directly to sanctions screening.
- Bespoke cases reach Legal pre-annotated with clause-risk flags, enabling a formal 2-business-day review SLA.
- A pre-approved clause library maintained by Legal serves as the classifier's ground truth and reduces full-review volume.
- The classifier is audited monthly against Legal-reviewed ground truth to track precision and recall.

## Rationale
Bespoke Legal review with no SLA is the largest source of unpredictable delay. Concentrating Legal effort on the genuinely bespoke 30% of cases gives the majority a predictable path without relaxing the wording control.

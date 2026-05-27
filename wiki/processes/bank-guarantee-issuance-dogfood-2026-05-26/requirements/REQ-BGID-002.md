---
id: REQ-BGID-002
type: requirement
section: requirements
title: AI classifier operates in shadow mode and meets accuracy gate before live routing
status: draft
confidence: low
source: wiki-synthesis-2026-05-26
reqType: FUNCTIONAL
moscow: MUST
derivedFrom: [TD-BGID-002]
addresses: [PP-BGID-002]
updatedBy: admin
updatedAt: 2026-05-26T20:15:01Z
---
## Requirement
The AI wording pre-classifier must operate in shadow mode for a minimum of two quarters, logging each classification against the Legal-reviewed outcome, and must achieve a false-positive rate below 1% before live routing is enabled.

## Rationale
IR-BGID-001 identifies mis-classification as a high-severity risk. The shadow-mode gate with a measured accuracy threshold is the control that must be satisfied before the classifier routes applications without human Legal review.

## Acceptance criteria
- The classifier logs every classification decision with a confidence score throughout the shadow period.
- Monthly precision and recall reports are produced and reviewed by the Legal team and the Trade Finance Manager.
- Live routing is not enabled until the false-positive rate has been below 1% for at least two consecutive months.
- A human-override path is available at all times regardless of classifier confidence score.

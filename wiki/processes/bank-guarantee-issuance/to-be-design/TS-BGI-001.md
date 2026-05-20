---
id: TS-BGI-001
type: target-state
section: to-be-design
title: Intelligent Intake with Automated Completeness Validation
status: draft
confidence: low
replaces: [PS-BGI-001]
provenance: {"Rationale": {"evidence": "", "source": "proposed"}, "Target description": {"evidence": "", "source": "proposed"}, "What changes": {"evidence": "", "source": "proposed"}}
---
## Target description
At intake, an agentic AI validator checks every submitted application for completeness before it reaches the Trade Finance Officer — verifying required fields, BIC format, currency validity and wording-type consistency. Clients receive an actionable exception list for immediate self-correction, so applications arrive complete and TFO time is not spent on information chasing.

## What changes
- Completeness check moves from TFO manual judgement to automated validation at Corporate Portal submission
- Clients receive structured feedback on missing or invalid fields before the application enters the TFO queue
- TFO intake step focuses on professional review, not clerical chasing
- System-enforced completeness closes CG-BGI-001

## Rationale
The current intake step is a bottleneck of avoidable rework. Moving validation upstream to the point of submission eliminates the most common cause of TFO delay and closes the intake control gap in a single change.

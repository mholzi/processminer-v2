---
id: TD-BGI-007
type: transformation-decision
section: transformation-decisions
title: Adopt ICC-SWIFT API Standards for Digital Guarantee Issuance
status: draft
confidence: low
resolves: [PP-BGI-006, CG-BGI-003]
realises: [TS-BGI-006]
fromIdea: [II-BGI-003]
provenance: {"Options considered": {"evidence": "", "source": "proposed"}, "Rationale": {"evidence": "", "source": "proposed"}, "The decision": {"evidence": "", "source": "proposed"}}
decisionType: build/buy
decisionStatus: proposed
---
## The decision
Adopt the ICC-SWIFT API standards to replace manual SWIFT MT 760 handling with API-based digital guarantee issuance, including system-enforced pre-transmission validation and automated facility utilisation update at transmission.

## Options considered
- Adopt ICC-SWIFT API standards for straight-through digital issuance
- Introduce a formal pre-transmission checklist within the current MT 760 workflow
- Keep current MT 760 process; mandate dual-TFO pre-transmission check

## Rationale
ICC-SWIFT API adoption resolves both PP-BGI-006 and CG-BGI-003 in one architecture change. A checklist closes only the control gap and leaves manual SWIFT handling and utilisation update risks open; a dual-TFO check adds cost without eliminating the structural cause.

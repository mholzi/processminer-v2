---
id: TS-BGIT-003
type: target-state
section: to-be-design
title: System-enforced post-approval generation gate at guarantee issuance
status: draft
confidence: high
source: source-target — bank-guarantee-issuance-test wiki
replaces: [PS-BGIT-006]
systems: [SYS-BGIT-002, SYS-BGIT-004]
provenance: {"Rationale": {"evidence": "M. Berger Stage 5 refinement session, 2026-05-20 — confirmed target state from source-target stub", "source": "elicited"}, "Target description": {"evidence": "M. Berger Stage 5 refinement session, 2026-05-20 — confirmed target state from source-target stub", "source": "elicited"}, "What changes": {"evidence": "M. Berger Stage 5 refinement session, 2026-05-20 — confirmed target state from source-target stub", "source": "elicited"}}
---
## Target description
The Trade Finance System enforces a hard gate at the guarantee generation step: no guarantee document can be generated or dispatched via SWIFT unless the TFS holds a valid TFM approval record for the transaction. This converts a currently undocumented manual step into a system-enforced control, closing the compliance gap (CG-BGIT-002) and creating an auditable record of every issuance against its approval.

## What changes
- TFS generation step requires a valid TFM approval record before proceeding
- Guarantee generation without prior approval is technically blocked at system level
- Every generation event is logged against the approval record, creating a complete audit trail
- The compliance gap at Step 6 (CG-BGIT-002) is closed by system enforcement

## Rationale
The current lack of a documented system control at generation creates an audit exposure. A hard TFS gate makes it technically impossible to issue a guarantee without an approval trail, directly satisfying the MaRisk four-eyes principle at the generation step.

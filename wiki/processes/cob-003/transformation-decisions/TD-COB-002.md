---
id: TD-COB-002
type: transformation-decision
section: transformation-decisions
title: Digitise the application front door
status: draft
confidence: low
source: Consolidated by source-target from the COB-003 wiki
decisionType: AUTOMATION
decisionStatus: PROPOSED
resolves: [PP-COB-001, PP-COB-004, FP-COB-001, FP-COB-002, FP-COB-003]
realises: [TS-COB-001]
fromIdea: [II-COB-001, II-COB-002, II-COB-003]
provenance: {"Options considered": {"evidence": "", "source": "proposed"}, "Rationale": {"evidence": "", "source": "proposed"}, "The decision": {"evidence": "", "source": "proposed"}}
---
## The decision
Replace the generic, paper-tolerant intake with a digital front door: a checklist tailored to the client's business type, real-time upload validation, an automated escalating reminder sequence, and e-signature captured inside the flow.

## Options considered
- Deliver the smart checklist, automated reminders and e-signature together as one front-door release
- Sequence them — checklist first, then reminders, then e-signature — as separate increments
- Add only automated reminders and leave the checklist and signatures unchanged
- Keep the current generic checklist and manual chasing

## Rationale
Incomplete first submissions cause two to three chasing rounds per application and the worst friction in the client journey. The three changes attack one root cause — the client never knowing upfront what is needed — so delivering them together gives a coherent front door, though phasing remains open.

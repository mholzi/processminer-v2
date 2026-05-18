---
id: TD-COB-008
type: transformation-decision
section: transformation-decisions
title: Stand up continuous controls monitoring
status: draft
confidence: low
source: Consolidated by source-target from the COB-003 wiki
decisionType: COMPLIANCE
decisionStatus: PROPOSED
resolves: [CG-COB-001, CG-COB-002]
realises: [TS-COB-005]
fromIdea: [II-COB-011]
provenance: {"Options considered": {"evidence": "", "source": "proposed"}, "Rationale": {"evidence": "", "source": "proposed"}, "The decision": {"evidence": "", "source": "proposed"}}
---
## The decision
Stand up continuous controls monitoring over onboarding: formalise account-configuration verification as a named, automatically tested control, and instrument product disclosure to capture a recorded client acknowledgement checked on every case.

## Options considered
- Implement continuous monitoring covering both account configuration and product disclosure
- Formalise the account-configuration control first and add disclosure monitoring later
- Document the missing control and standardise disclosure without automated monitoring
- Leave both control gaps open until the next audit cycle

## Rationale
One control is undocumented and invisible to audit; another is rated only medium-effective for want of evidence. Continuous monitoring closes both at once — it gives the verification control an owner and trail and supplies the disclosure proof audit lacks, and resilience rules increasingly expect it.

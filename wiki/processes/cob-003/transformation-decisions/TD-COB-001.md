---
id: TD-COB-001
type: transformation-decision
section: transformation-decisions
title: Adopt a unified onboarding case platform
status: draft
confidence: low
source: Consolidated by source-target from the COB-003 wiki
decisionType: PLATFORM
decisionStatus: PROPOSED
resolves: [PP-COB-002]
realises: [TS-COB-002]
fromIdea: [II-COB-004]
provenance: {"Options considered": {"evidence": "", "source": "proposed"}, "Rationale": {"evidence": "", "source": "proposed"}, "The decision": {"evidence": "", "source": "proposed"}}
---
## The decision
Adopt a single onboarding case platform that orchestrates CRM, workflow, KYC, screening, core banking and card management behind one case view, with data entered once and propagated, replacing today's six-plus disconnected systems.

## Options considered
- Build an integration layer and unified case view over the existing systems
- Buy a packaged onboarding-orchestration platform and migrate onto it
- Leave the systems separate and add only a read-only consolidated dashboard
- Do nothing and accept the re-keying and handover cost

## Rationale
The system-fragmentation pain point is the bank's core efficiency problem and underlies most handover delay and data-entry error. A consolidated dashboard alone would not stop re-keying; only a true orchestration layer removes it. Build-versus-buy is left open for the transformation-agent and the SME to weigh.

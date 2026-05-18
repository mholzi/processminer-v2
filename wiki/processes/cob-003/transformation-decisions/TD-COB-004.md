---
id: TD-COB-004
type: transformation-decision
section: transformation-decisions
title: Modernise KYC screening and ownership capture
status: draft
confidence: low
source: Consolidated by source-target from the COB-003 wiki
decisionType: TECHNOLOGY
decisionStatus: PROPOSED
resolves: [PP-COB-003, FP-COB-004]
realises: [TS-COB-003]
fromIdea: [II-COB-005, II-COB-007]
provenance: {"Options considered": {"evidence": "", "source": "proposed"}, "Rationale": {"evidence": "", "source": "proposed"}, "The decision": {"evidence": "", "source": "proposed"}}
---
## The decision
Deploy AI-assisted screening that auto-clears low-risk routine alerts and learns from analyst decisions to suppress repeat false matches, and add a plain-language conversational assistant that guides clients through ownership and control questions.

## Options considered
- Introduce AI screening and the conversational ownership assistant together as one KYC modernisation
- Tackle AI screening first and add the client-facing assistant later
- Re-tune screening thresholds manually without an AI learning loop
- Keep conservatively-tuned screening and regulatory-language questions unchanged

## Rationale
A 40% false-positive rate and ownership questions clients cannot answer both inflate the KYC step. Treating them as one modernisation keeps the screening and the data feeding it improving together, though the explainability layer regulators require must be built alongside.

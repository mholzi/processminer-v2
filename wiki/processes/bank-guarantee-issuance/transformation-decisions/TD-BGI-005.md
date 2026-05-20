---
id: TD-BGI-005
type: transformation-decision
section: transformation-decisions
title: Replace or Augment Sanctions Screening with NLP-Based Engine
status: draft
confidence: low
resolves: [PP-BGI-004]
realises: [TS-BGI-004]
fromIdea: [II-BGI-002]
provenance: {"Options considered": {"evidence": "", "source": "proposed"}, "Rationale": {"evidence": "", "source": "proposed"}, "The decision": {"evidence": "", "source": "proposed"}}
decisionType: build/buy
decisionStatus: proposed
---
## The decision
Replace or augment the current string-match Sanctions Screening Tool with an NLP-based engine that incorporates contextual signals — beneficiary country, industry, historical analyst decisions — to reduce false positive rates on common beneficiary names.

## Options considered
- Buy and integrate an NLP-enhanced sanctions screening vendor solution
- Build a custom NLP disambiguation layer on top of the existing tool
- Keep existing tool; add analyst-maintained exclusion list for known false positive names

## Rationale
Vendor NLP engines offer proven false-positive reduction at lower build risk than a custom layer. An analyst-maintained exclusion list is a workaround that does not address the root cause and requires ongoing manual maintenance as names and screening lists change.

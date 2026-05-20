---
id: TS-BGI-004
type: target-state
section: to-be-design
title: Contextual Sanctions Screening with NLP-Driven Disambiguation
status: draft
confidence: low
replaces: [PS-BGI-004]
provenance: {"Rationale": {"evidence": "", "source": "proposed"}, "Target description": {"evidence": "", "source": "proposed"}, "What changes": {"evidence": "", "source": "proposed"}}
---
## Target description
The sanctions screening step is augmented with an NLP-based matching engine that incorporates beneficiary country, industry context and historical analyst decisions to distinguish genuine sanctions hits from common-name false positives. The Compliance Analyst's workload focuses on genuine investigations rather than avoidable clearances.

## What changes
- String-match sanctions screening augmented or replaced by NLP-based contextual engine
- False positive rate reduced, freeing Compliance Analyst capacity for genuine hits
- Historical analyst decisions feed a calibration loop, improving accuracy over time
- Escalation paths (borderline → Compliance Officer; serious → Group Compliance / MLRO) unchanged

## Rationale
PP-BGI-004 is a workload and delay issue driven by a known technical limitation of string-match screening. NLP disambiguation is the industry-standard remedy and preserves the existing escalation control structure intact.

---
id: PP-BGI-004
type: pain-point
section: pain-points
title: False Positives on Common Beneficiary Names
status: draft
confidence: high
category: rework
severity: MEDIUM
affects: [PS-BGI-004]
provenance: {"Description": {"evidence": "false positives on common beneficiary names generate avoidable investigation work", "source": "elicited"}, "Impact": {"evidence": "false positives on common beneficiary names generate avoidable investigation work", "source": "elicited"}, "Root cause": {"evidence": "", "source": "proposed"}}
---
## Description
The Sanctions Screening Tool generates false positive hits on common or generic beneficiary names, triggering Compliance investigations for applications that are clearly not sanctions-related.

## Impact
The Compliance Analyst spends time investigating and clearing false positives, adding avoidable delay to applications that should proceed without intervention.

## Root cause
Screening tools match on name strings without sufficient contextual disambiguation, making common beneficiary names disproportionately likely to match sanctions list entries.

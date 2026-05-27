---
id: IR-DDMM-003
type: innovation-risk
section: innovation-risks
title: AI Pre-Classification Entrences Mis-Codes from Historical Data
status: draft
confidence: high
source: ddmm-innovation-analyst
severity: MEDIUM
affects: [II-DDMM-004]
---
## The risk
Automated R-transaction pre-classification (II-DDMM-004) trains on historical resolution records. OAF-DDMM-002 documents that R-transaction resolution rationale is not consistently recorded — meaning the training corpus already contains mis-codes. A model trained on this data reinforces those errors at scale if outputs are accepted without review.

## Likelihood & impact
High likelihood given documented OAF-DDMM-002 data-quality gap in historical records. Impact is MEDIUM: entrenched mis-classification degrades downstream reporting quality and may propagate incorrect codes into scheme submissions.

## Mitigation
Conduct a data-quality remediation pass on historical R-transaction records before training. Mandate human review of pre-classification outputs for a defined calibration period; surface accuracy metrics and override rates in periodic reporting before reducing review intensity.

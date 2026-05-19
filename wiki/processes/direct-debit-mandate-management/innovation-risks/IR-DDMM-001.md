---
id: IR-DDMM-001
type: innovation-risk
section: innovation-risks
title: Risk-Scoring Model Introduces Compliance Exposure if Miscalibrated
status: draft
confidence: high
source: ddmm-innovation-analyst
severity: HIGH
affects: [II-DDMM-007]
provenance: {"Likelihood & impact": {"evidence": "SME confirmed: risk is not that the model exists but that it operates before scoring criteria are regulatory-approved; a miscalibrated threshold could silently weaken dual-control coverage.", "source": "elicited"}, "Mitigation": {"evidence": "SME confirmed: Compliance and Risk must formally approve scoring criteria before any production routing; model calibration reviewed periodically.", "source": "elicited"}, "The risk": {"evidence": "SME (M. Vogel) confirmed: routing decisions driven by a risk model operating before Compliance sign-off could misclassify batches — sending a high-risk batch to spot-check instead of full dual-control.", "source": "elicited"}}
---
## The risk
The risk-based routing model (II-DDMM-007) determines which batches receive full dual-control and which receive spot-check. If the scoring criteria are not formally approved by Compliance and Risk before go-live, or if thresholds drift post-deployment, batches that warrant full review may be routed to lighter checks without detection.

## Likelihood & impact
Likely if the initiative is delivered without a formal Compliance sign-off gate on the scoring model. Impact is HIGH: a miscalibrated threshold silently degrades the dual-control coverage that CG-DDMM-003 seeks to address, while creating the appearance of compliance.

## Mitigation
Formal Compliance and Risk approval of scoring criteria is a hard prerequisite before production routing. Threshold calibration reviewed at defined intervals; override logs surfaced in CP-DDMM-003 reporting to catch edge cases.

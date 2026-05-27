---
id: IR-BGI-001
type: innovation-risk
section: innovation-risks
title: EU AI Act Classification Risk for Intake Validation Agent
status: draft
confidence: medium
severity: MEDIUM
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-20
---
## The risk
The intake validation agent may qualify as a high-risk AI system under EU AI Act Annex III (credit assessment or access to financial services) if regulators determine it materially influences whether an application proceeds. Deploying without a conformity assessment would expose the bank to supervisory action.

## Likelihood & impact
Likelihood: medium — the administrative-field-validation characterisation is defensible (the agent does not score creditworthiness) but has not been opined on by Model Risk or Compliance. Impact if in-scope: mandatory conformity assessment, human oversight documentation, transparency obligations to applicants, and potential deployment halt.

## Mitigation
Obtain a formal Model Risk and Compliance opinion on EU AI Act classification before any deployment decision. If high-risk classification is confirmed, run the conformity assessment in parallel with the shadow pilot to avoid blocking deployment after pilot success.

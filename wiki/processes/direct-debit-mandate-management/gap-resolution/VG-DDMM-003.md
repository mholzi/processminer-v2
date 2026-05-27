---
id: VG-DDMM-003
type: gap
section: gap-resolution
title: Risk-Scoring Model Compliance Approval Gate Not Operationalised
status: draft
confidence: high
source: ddmm-transformation-agent
validationArea: Governance
gapStatus: open
---
## The gap
TS-DDMM-004 and TD-DDMM-005 require Compliance to formally approve the risk-scoring model before go-live, but no element defines the approval gate structure, ownership, or criteria. The condition is stated as a prerequisite but not operationalised.

## Resolution
Design a formal Compliance approval gate for the risk-scoring model: document scoring criteria, submit for Compliance and Risk sign-off with explicit approval criteria, and make production routing contingent on that sign-off. Require Compliance to review calibration at defined intervals post-launch; any boundary change requires re-approval.

## Status
OPEN. Approval gate must be designed as part of the TS-DDMM-004 delivery plan before the routing model goes live in production.

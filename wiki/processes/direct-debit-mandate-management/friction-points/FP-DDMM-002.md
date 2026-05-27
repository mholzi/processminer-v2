---
id: FP-DDMM-002
type: friction-point
section: friction-points
title: Rejection Without Remediation Guidance
status: draft
confidence: high
source: ddmm-client-journey-specialist
severity: HIGH
occursAt: [PS-DDMM-002]
---
## Description
When a mandate is rejected at validation, the portal shows a structured reason code and a short standard description but provides no guidance on what the creditor should change to resolve the error and resubmit successfully.

## Root cause
The validation engine returns a reason code from a fixed catalogue; the portal renders the associated standard description but has no per-code remediation content. No self-service help layer was built for the rejection flow.

## Client impact
Creditors escalate to their RM or the Payments service desk to understand what to fix — adding latency and indirect effort. Ambiguous codes (inactive CI, type/sequence mismatch) prompt repeat escalations. A second rejection on the corrected resubmission is the worst-case outcome, compounding frustration and delay.

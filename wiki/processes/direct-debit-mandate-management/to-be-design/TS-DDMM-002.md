---
id: TS-DDMM-002
type: target-state
section: to-be-design
title: Guided Self-Service Registration and Amendment
status: draft
confidence: high
source: ddmm-transformation-agent
replaces: [PS-DDMM-001, PS-DDMM-002]
systems: [SYS-DDMM-001]
risks: []
---
## Target description
The Creditor Portal provides inline field-level validation with immediate human-readable error messages for every rejection. Each rejection includes specific remediation guidance mapped to the failure type — IBAN format, missing fields, SEPA scheme check failures — so the creditor knows exactly what to correct. Bulk file submissions receive a line-item rejection report with per-row remediation guidance, eliminating the current experience of a bare error code with no forward path. The portal preserves valid fields on partial correction submissions, removing the need to re-enter complete records on each iteration.

## What changes
- Inline field validation with human-readable error messages replaces bare error codes at point of submission
- Per-rejection-type remediation guidance surfaced in the portal at point of failure
- Bulk file line-item rejection report includes remediation guidance per row, not just reason codes
- Portal edit flow preserves valid fields on partial correction submissions
- Validated fields marked visually before final submission, reducing preventable errors

## Rationale
FP-DDMM-001 and FP-DDMM-002 are the same structural failure applied at two scales — solo and bulk — and both are LOW complexity to fix. Inline guidance breaks the re-work and RM-escalation cycle at source.

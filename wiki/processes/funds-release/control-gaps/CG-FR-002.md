---
id: CG-FR-002
type: compliance-gap
section: control-gaps
title: Facility limit check is point-in-time — concurrent releases can over-draw
status: draft
confidence: high
source: SME interview - M. Berger
severity: HIGH
gapStatus: open
control: [CP-FR-001]
---
## The gap
CP-FR-001's limit check runs once, at validation, against the available undrawn limit as read then. The limit is not decremented when a release is approved, and the check is not re-run at execution.

## Risk
Concurrent releases against the same facility can each pass validation and together over-draw the facility — the unauthorised credit exposure the control exists to prevent.

## Remediation
Decrement the available limit when a release is approved, or re-run the limit check at execution, so the control reflects in-flight releases rather than a single validation-time figure.

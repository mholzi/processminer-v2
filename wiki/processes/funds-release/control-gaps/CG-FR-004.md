---
id: CG-FR-004
type: compliance-gap
section: control-gaps
title: Treasury funding confirmation is point-in-time — not an earmark
status: draft
confidence: high
source: SME interview - M. Berger
severity: MEDIUM
gapStatus: open
control: [CP-FR-004]
---
## The gap
CP-FR-004 confirms funding is available for the value date as a point-in-time check; it does not earmark or reserve the funding against the release. Confirmed funding can be consumed by another release before execution.

## Risk
A large release that passed funding confirmation can still fail at execution (EX-FR-005) because the confirmed funding was not locked — the control provides assurance it cannot keep.

## Remediation
Earmark Treasury-confirmed funding against the named release until it is posted, or re-confirm funding at execution, so the control's assurance holds to the point of release.

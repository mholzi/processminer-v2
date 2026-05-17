---
id: CG-FR-005
type: compliance-gap
section: control-gaps
title: Audit-log review is monthly and sample-based
status: draft
confidence: medium
source: funds-release-dtp-mockup.md
severity: LOW
gapStatus: monitored
control: [CP-FR-006]
---
## The gap
CP-FR-006 reviews audit-log completeness monthly on a sample, so an incomplete trail could persist undetected for up to a month.

## Risk
A release whose actors or timestamps are missing going unnoticed until well after the event.

## Remediation
Replace the sample review with an automated completeness assertion that flags any release record missing a required field.

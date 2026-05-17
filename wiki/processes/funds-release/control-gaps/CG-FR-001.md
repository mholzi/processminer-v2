---
id: CG-FR-001
type: compliance-gap
section: control-gaps
title: Treasury funding confirmation not system-enforced
status: draft
confidence: high
source: funds-release-dtp-mockup.md
severity: HIGH
gapStatus: open
control: [CP-FR-004]
---
## The gap
CP-FR-004 relies on Treasury confirming funding by email; the release system does not block execution until that confirmation is recorded, so a large release can proceed unconfirmed.

## Risk
A release at or above EUR 5M settling without confirmed funding, leaving the bank short on the value date.

## Remediation
Add a system gate at PS-FR-007 that blocks execution of threshold releases until a Treasury confirmation reference is captured.

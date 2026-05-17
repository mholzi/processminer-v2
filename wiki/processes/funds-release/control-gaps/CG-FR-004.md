---
id: CG-FR-004
type: compliance-gap
section: control-gaps
title: Sanctions list currency not evidenced
status: draft
confidence: high
source: funds-release-dtp-mockup.md
severity: HIGH
gapStatus: open
control: [CP-FR-002]
---
## The gap
CP-FR-002 screens against sanctions lists, but no control proves the lists loaded into the screening engine are the current EU and UN consolidated versions.

## Risk
Screening against a stale list and clearing a release to a newly designated party.

## Remediation
Add an automated daily check that verifies the screening engine's list version against the official source and alerts on a mismatch.

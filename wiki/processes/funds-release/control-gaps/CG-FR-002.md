---
id: CG-FR-002
type: compliance-gap
section: control-gaps
title: Reconciliation is T+1, manual and detective only
status: draft
confidence: high
source: funds-release-dtp-mockup.md
severity: MEDIUM
gapStatus: open
control: [CP-FR-005]
---
## The gap
CP-FR-005 reconciles held versus released balances only once a day and after the fact, so a posting error can stand uncorrected for up to a business day.

## Risk
A release error or balance mismatch reaching the client and the general ledger before anyone detects it.

## Remediation
Move reconciliation to an intraday automated check, or add a same-day exception sweep for releases above the Treasury threshold.

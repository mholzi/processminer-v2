---
id: CG-FR-001
type: compliance-gap
section: control-gaps
title: 4-eyes control coverage overstated — STP carve-out
status: draft
confidence: high
source: SME interview - M. Berger
severity: HIGH
gapStatus: open
control: [CP-FR-003, CP-FR-006]
---
## The gap
CP-FR-003 states that segregation of duties (4-eyes) is performed on every release item, but STP-eligible clean items receive a system-applied first- and second-line approval — no second human reviews them. The control's stated coverage overstates reality.

## Risk
A clean STP release is initiated and authorised end-to-end with no human dual-control, so a fraudulent or erroneous item could pass unchecked; an auditor reading its audit log sees only a system actor and no human approver.

## Remediation
Reword CP-FR-003 to state the STP carve-out; assess a compensating control for system-approved releases; and extend CP-FR-006's audit-log completeness review with an STP-aware check that flags releases carrying no human approver.

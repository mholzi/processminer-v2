---
id: CP-NH-011
type: control
section: controls
title: Segregation of duties — HR Ops cannot self-approve own compensation
status: draft
confidence: medium
source: new-hr-onboarding-dtp.md
controlType: PREVENTIVE
execution: HYBRID
owner: HR Operations
step: [ps-7, ps-22]
provenance: {"Control activity": {"evidence": "CTL-NHO-05 evidence: Workday config + quarterly access review. The mechanism (system config prevents self-approval; quarterly review validates configuration) is inferred from the evidence column.", "source": "document"}, "Risk addressed": {"evidence": "", "source": "proposed"}, "Timing": {"evidence": "CTL-NHO-05 | Segregation of duties: HR Ops cannot self-approve own compensation entries | Continuous | Workday config + quarterly access review", "source": "document"}, "What it checks": {"evidence": "CTL-NHO-05 | Segregation of duties: HR Ops cannot self-approve own compensation entries | Continuous | Workday config + quarterly access review.", "source": "document"}}
updatedBy: admin
updatedAt: 2026-05-25T14:01:22Z
---
## What it checks
Whether any HR Operations employee is able to both enter and approve their own compensation entries in Workday, which would breach segregation of duties.

## Control activity
Workday system configuration prevents an HR Ops user from approving compensation transactions for records on which they are also the initiating user. A quarterly access review validates that the configuration has not been circumvented. The Workday system config and quarterly access review outputs serve as evidence.

## Risk addressed
Without this segregation, an HR Operations employee could fraudulently create or inflate their own compensation — an internal fraud and financial misstatement risk.

## Timing
Continuous. The system-level segregation is always active; the compensating quarterly access review validates the configuration has not drifted.

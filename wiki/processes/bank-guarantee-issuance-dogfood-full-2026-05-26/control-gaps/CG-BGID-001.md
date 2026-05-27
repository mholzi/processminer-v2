---
id: CG-BGID-001
type: compliance-gap
section: control-gaps
title: No Control on Application Completeness Check at Intake
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
severity: LOW
gapStatus: mitigated
control: []
updatedBy: admin
updatedAt: 2026-05-26T09:38:01Z
---
## The gap
The completeness check at Application Intake (PS-BGID-001) is performed manually by the Trade Finance Officer with no system enforcement — the Corporate Portal does not block submission on missing mandatory fields.

## Risk
An incomplete application could advance past intake if an officer misses a missing field, causing rework or delay at a later step.

## Remediation
Accepted risk in the As-Is. The bank relies on downstream controls — CP-BGID-003 (Facility Limit Check) and CP-BGID-001 (Four-Eyes Issuance Approval) — to catch material issues before issuance. The gap is closed in the target state by TS-BGID-001 via TD-BGID-003 (Smart Intake Portal, mandatory field enforcement at submission). No additional As-Is control is planned.

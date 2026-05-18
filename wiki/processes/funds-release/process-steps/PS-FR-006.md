---
id: PS-FR-006
type: process-step
section: process-steps
title: Second-line approval (4-eyes)
status: draft
confidence: high
source: funds-release-dtp-mockup.md
owner: Operations Approver on non-STP and exception items; the payments workflow tool applies a system second-line approval on STP-eligible clean items
systems: [SYS-FR-001]
transitions: [PS-FR-007|normal|when 4-eyes approval is granted, PS-FR-004|loopback|when not granted for a validation or first-line defect, PS-FR-003|loopback|when not granted for a screening concern, PS-FR-005|loopback|when not granted for a funding concern, EX-FR-004|exception|when the approver is unavailable or 4-eyes is breached]
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-17
---
## What happens
For a non-STP or exception item a separate Operations Approver — never the person who gave first-line approval — authorises the release under the 4-eyes principle. The review is substantive: the approver re-checks validation result, screening disposition, Treasury funding confirmation and beneficiary details, not merely that prior steps show green. For an STP-eligible clean item the payments workflow tool applies a system second-line approval, so no second human reviews it. A not-granted item routes back by reason — a validation defect to PS-FR-004, a screening concern to PS-FR-003, a funding concern to PS-FR-005.

## Inputs
- First-line approved release request
- Treasury funding confirmation where the EUR 5m threshold applied
- Validation result, screening disposition and beneficiary details for the substantive re-check
- The STP-eligibility flag on the item

## Outputs
- Second-line authorised release request — substantive human review for non-STP items, system-applied for STP items
- Items routed back by rejection reason to PS-FR-004, PS-FR-003 or PS-FR-005 where approval is not granted
- Items parked and escalated to the Operations Team Lead where the approver is unavailable or 4-eyes is breached (EX-FR-004)

## Why it matters
Independent second-line approval enforces segregation of duties so no single person can both initiate and authorise a release. The control is genuine only for non-STP items; STP-eligible items receive a system second-line approval with no second human — see control gap CG-FR-001.

---
id: PP-BGIT-001
type: pain-point
section: pain-points
title: Credit limit stalls
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
category: delay
severity: HIGH
affects: [PS-BGIT-002]
provenance: {"Description": {"evidence": "Applications frequently stall at the credit and facility check when the client has not pre-arranged enough limit. this is the most common reason for delay.", "source": "document"}, "Impact": {"evidence": "M. Berger: standing approval", "source": "elicited"}, "Root cause": {"evidence": "Applications frequently stall at the credit and facility check when the client has not pre-arranged enough limit; M. Berger: no formal SLA on Credit team response (informally 1–2 business days) compounds the stall duration — documented as PG-BGIT-001", "source": "elicited"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-20
---
## Description
Applications frequently stall at the credit and facility check when the client has not pre-arranged sufficient limit. This is the most common reason for delay.

## Impact
Causes delays in guarantee issuance, identified as the most common reason for process delay, potentially pushing turnaround beyond the 3-business-day SLA target.

## Root cause
Clients submit applications without pre-arranging sufficient facility limit, triggering a Credit team referral. The absence of a formal Credit team response SLA (informally 1–2 business days; see PG-BGIT-001) compounds the stall duration.

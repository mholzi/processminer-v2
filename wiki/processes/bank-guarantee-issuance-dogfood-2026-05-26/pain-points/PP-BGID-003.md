---
id: PP-BGID-003
type: pain-point
section: pain-points
title: Commercial Contract Reference Frequently Missing or Wrong at Intake
status: draft
category: data-quality
severity: MEDIUM
priority: P2
affects: [PS-BGID-001]
provenance: {"Description": {"evidence": "Commercial contract reference is missing or wrong on roughly 1 in 5 applications.", "source": "elicited"}, "Impact": {"evidence": "The Portal does not validate it, so the officer catches it visually and bounces it back.", "source": "elicited"}, "Root cause": {"evidence": "The Portal does not validate the commercial contract reference before submission.", "source": "elicited"}}
updatedBy: the assistant
updatedAt: 2026-05-26T05:28:26Z
---
## Description
The commercial contract reference — required to establish the underlying transaction a guarantee is being issued against — is missing or incorrect on approximately 1 in 5 applications. The Corporate Portal does not validate this field before submission, so errors reach the Trade Finance Officer at intake.

## Impact
Each affected application is returned to the client or RM with a checklist of missing fields, breaking the intake flow and adding unquantified turnaround time before the application can advance to the credit and facility check.

## Root cause
The Corporate Portal performs no validation on the commercial contract reference field. Clients and RMs can submit an application with a blank or malformed reference, leaving the Trade Finance Officer as the sole detection point.

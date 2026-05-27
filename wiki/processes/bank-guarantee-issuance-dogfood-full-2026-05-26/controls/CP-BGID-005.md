---
id: CP-BGID-005
type: control
section: controls
title: Sanctions Screening Hit Rationale Capture
status: draft
confidence: medium
source: Internal Audit 2025 — OAF-BGID-003 remediation
controlType: DETECTIVE
execution: MANUAL
effectiveness: MEDIUM
owner: Compliance Analyst
step: [PS-BGID-004]
regulatedBy: [REG-BGID-001, REG-BGID-011]
updatedBy: admin
updatedAt: 2026-05-26T09:37:44Z
---
## What it checks
Whether a Compliance Analyst who dismisses a sanctions screening hit has recorded a contemporaneous written justification in the application audit trail before marking the hit as cleared.

## Control activity
The Compliance Analyst completes a mandatory rationale field in the TFS sanctions screening workflow before a hit can be marked cleared. The field is non-nullable and captured as an immutable, timestamped audit-trail entry. This control is in implementation as the TFS enhancement remediated by OAF-BGID-003; target live Q4 2026.

## Risk addressed
Without this control, a sanctions hit dismissed without documented justification cannot be reviewed post-hoc by regulators, exposing the bank to penalties under AMLD5 Art. 40 and the EU Sanctions Regulation.

## Timing
The control runs at the Sanctions and Compliance Screening step (PS-BGID-004) each time a Compliance Analyst records a dismissal on a screening hit — once per hit per application.

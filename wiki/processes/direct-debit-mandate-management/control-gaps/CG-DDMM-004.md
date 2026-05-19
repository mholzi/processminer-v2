---
id: CG-DDMM-004
type: compliance-gap
section: control-gaps
title: No Periodic Re-Screening of Active Mandate Register
status: draft
confidence: high
source: ddmm-control-compliance-specialist
severity: HIGH
gapStatus: OPEN
control: [CP-DDMM-002]
regulation: [REG-DDMM-002, REG-DDMM-003]
provenance: {"Remediation": {"evidence": "SME confirmed: implement periodic (or event-driven) re-screening of active mandates against current sanctions lists; define frequency and ownership.", "source": "elicited"}, "Risk": {"evidence": "SME confirmed: a creditor or debtor designated after initial registration remains undetected; EU sanctions regulations and AML/GwG require ongoing screening obligations, not just point-in-time.", "source": "elicited"}, "The gap": {"evidence": "SME (M. Vogel) confirmed: CP-DDMM-002 screens at registration only; no re-screening process exists when sanctions lists are updated post-registration.", "source": "elicited"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-19
---
## The gap
CP-DDMM-002 screens creditors and debtors at mandate registration only. There is no process to re-screen the active mandate register when sanctions lists are updated, meaning a party designated after initial registration will not be flagged until the mandate is next amended or submitted.

## Risk
Ongoing execution of collections for a newly designated party breaches EU Sanctions Regulations and AML obligations under GwG. Both regimes impose continuous screening obligations, not only point-in-time checks at onboarding.

## Remediation
Implement periodic or list-update-triggered re-screening of active mandates; define screening frequency, ownership (Compliance), and escalation path for any hits identified post-registration.

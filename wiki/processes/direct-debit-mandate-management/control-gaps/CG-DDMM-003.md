---
id: CG-DDMM-003
type: compliance-gap
section: control-gaps
title: No Four-Eyes Control on Single-Mandate Registration
status: draft
confidence: high
source: ddmm-control-compliance-specialist
severity: MEDIUM
gapStatus: OPEN
control: [CP-DDMM-003]
regulation: [REG-DDMM-006]
provenance: {"Remediation": {"evidence": "SME confirmed: assess whether risk appetite supports extending dual-control (or a sampling check) to single registrations, or document explicit risk-acceptance.", "source": "elicited"}, "Risk": {"evidence": "SME confirmed: single-mandate errors (incorrect IBAN, CI, UMR) can register without detection; MaRisk requires key operational processes to have adequate controls.", "source": "elicited"}, "The gap": {"evidence": "SME (M. Vogel) confirmed: the dual-control in CP-DDMM-003 applies only to batches above 50 mandates; individual mandate registrations have no second-reviewer check.", "source": "elicited"}}
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## The gap
CP-DDMM-003 applies dual-control review only to bulk files exceeding 50 mandates. Individual single-mandate registrations proceed without a second reviewer, meaning keying errors (wrong IBAN, UMR, or CI) can reach the MMS unchecked.

## Risk
Undetected data-entry errors in single-mandate registrations may lead to failed collections or incorrect mandate records. MaRisk requirements for adequate operational controls in key banking processes are not fully met.

## Remediation
Assess risk appetite for extending dual-control or a risk-based sample check to single-mandate registrations; if not implemented, document explicit risk-acceptance and compensating controls.

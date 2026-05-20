---
id: CG-DDMM-002
type: compliance-gap
section: control-gaps
title: IBAN Amendment Treatment May Be Scheme Non-Compliant
status: draft
confidence: high
source: ddmm-control-compliance-specialist
severity: HIGH
gapStatus: open
control: [CP-DDMM-001]
regulation: [REG-DDMM-001, REG-DDMM-005]
provenance: {"Remediation": {"evidence": "SME confirmed: obtain formal scheme-compliance opinion and update CP-DDMM-001 or the IBAN-amendment procedure accordingly.", "source": "elicited"}, "Risk": {"evidence": "SME confirmed: scheme non-compliance risk if IBAN change is treated as amendment rather than new mandate; enforcement from EPC.", "source": "elicited"}, "The gap": {"evidence": "SME (M. Vogel) confirmed: IBAN amendment treatment unconfirmed against SEPA SDD Scheme Rules; PG-DDMM-004 records the open question.", "source": "elicited"}}
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## The gap
IBAN changes to existing mandates are processed as versioned in-place amendments under CP-DDMM-001. Whether the SEPA SDD Scheme Rules require an IBAN change to be treated as a new mandate (new UMR) has not been confirmed, making the current procedure potentially scheme non-compliant.

## Risk
Processing IBAN changes as amendments rather than new mandates may breach EPC SEPA SDD Scheme Rules and PSD2 mandate-validity requirements, exposing the bank to scheme sanctions or transaction disputes.

## Remediation
Obtain a formal scheme-compliance opinion on IBAN amendment treatment; update CP-DDMM-001 and the amendment procedure to require a new mandate if required by scheme rules, and close PG-DDMM-004.

---
id: EX-BGI-002
type: exception
section: exceptions
title: Sanctions Screening Hit
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
category: sanctions
impact: HIGH
handlingOwner: Compliance Analyst
provenance: {"Description": {"evidence": "The Compliance Analyst screens the beneficiary and the beneficiary's country against the sanctions list. A screening hit suspends the application pending Compliance investigation.", "source": "document"}, "Handling": {"evidence": "Routine clears decided by Analyst; borderline hits escalate to Compliance Officer; serious matches to Group Compliance / MLRO. False positives follow the same suspend-investigate-clear path but typically conclude quickly at the Analyst tier.", "source": "elicited"}, "Impact": {"evidence": "accurate, keep it — but escalation is normally to the Compliance Officer, with Group Compliance only for the most serious hits", "source": "elicited"}}
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-19
---
## Description
The beneficiary or the beneficiary's country matches an entry on one of the sanctions lists screened during the compliance screening step.

## Handling
The application is suspended pending investigation. The Compliance Analyst investigates: routine clears and false positives are decided at the Analyst tier and typically conclude quickly; borderline hits escalate to the Compliance Officer; serious matches (sanctioned entity or country watch-list) escalate to Group Compliance / MLRO.

## Impact
Suspends the application; issuance cannot proceed until Compliance concludes its investigation. Resolution typically takes days to weeks. Escalation is normally to the Compliance Officer; the most serious hits may reach Group Compliance.

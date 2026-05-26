---
id: EX-BGID-002
type: exception
section: exceptions
title: Sanctions Screening Hit
status: draft
confidence: medium
source: bank-guarantee-issuance-v1.md
category: sanctions hit
impact: HIGH
frequencyPct:
handlingOwner: Compliance Analyst
provenance: {"Description": {"evidence": "\"The Compliance Analyst screens the beneficiary and the beneficiary's country against the sanctions list. A screening hit suspends the application pending Compliance investigation.\" (step 4)", "source": "document"}, "Handling": {"evidence": "\"A screening hit suspends the application pending Compliance investigation.\" (step 4); \"The process is subject to anti-money-laundering and sanctions obligations (EU sanctions regulations, AML directives).\" (Regulatory context)", "source": "document"}, "Impact": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-26T05:17:42Z
---
## Description
The Compliance Analyst's screening of the beneficiary and the beneficiary's country against the sanctions list returns a positive hit. The exception arises during the Sanctions and Compliance Screening step and suspends the application pending Compliance investigation.

## Handling
The application is suspended pending Compliance investigation. The process is subject to AML and sanctions obligations including EU sanctions regulations and AML directives.

## Impact
A screening hit halts issuance. The standard 3-business-day SLA is measured only for guarantees with no screening hit, so the turnaround clock does not apply during a Compliance investigation.

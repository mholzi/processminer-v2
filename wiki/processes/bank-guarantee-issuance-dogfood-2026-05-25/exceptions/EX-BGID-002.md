---
id: EX-BGID-002
type: exception
section: exceptions
title: Sanctions Screening Hit
status: draft
confidence: medium
source: bank-guarantee-issuance-v1.md
category: sanctions/compliance
impact: HIGH
handlingOwner: Compliance Analyst
provenance: {"Description": {"evidence": "A screening hit suspends the application pending Compliance investigation.", "source": "document"}, "Handling": {"evidence": "A screening hit suspends the application pending Compliance investigation.", "source": "document"}, "Impact": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:56:56Z
---
## Description
Occurs during the sanctions and compliance screening step when the beneficiary or the beneficiary's country matches an entry on the sanctions list.

## Handling
The application is suspended pending a Compliance investigation conducted by the Compliance Analyst.

## Impact
Suspends issuance entirely until the Compliance investigation concludes, delaying guarantee delivery.

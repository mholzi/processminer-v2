---
id: PG-SP-005
type: process-gap
section: process-gaps
title: Beneficiary name-check handling not described
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
area: As-Is process
gapStatus: open
affects: [PS-SP-002]
provenance: {"Impact": {"evidence": "", "source": "proposed"}, "Next step": {"evidence": "§10 open question: 'How are positive/negative beneficiary-name-check results handled today?'; §8 systems table: 'Payment Hub — Validation, routing, orchestration, message generation'", "source": "document"}, "The gap": {"evidence": "§5.1 step 2 lists validation checks (IBAN structure, BIC reachability, currency, mandatory fields, duplicate) with no mention of name verification; §10 open question: 'How are positive/negative beneficiary-name-check results handled today?'", "source": "document"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:00Z
---
## The gap
The validation step (ps-2) checks IBAN structure, BIC reachability and mandatory fields, but the document does not describe how beneficiary name-check results are handled. It is unclear whether the bank performs a name-to-IBAN match, how a positive match (name matches) or a negative match (name does not match) is surfaced to the customer, and whether a mismatch blocks the payment or generates a warning.

## Impact
Without a documented current-state handling procedure, it is impossible to assess the bank's exposure or design an improvement in the target state. The validate-instruction step (ps-2) may be incomplete as documented.

## Next step
Ask the SME whether a name-check service is currently integrated into the Payment Hub. If so, document the match/mismatch logic, the customer-facing message, and whether a mismatch is a hard or soft block. If not, flag it as a control gap.

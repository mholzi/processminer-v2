---
id: PG-SPP-006
type: process-gap
section: process-gaps
title: Bank-initiated outbound recall not documented
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
area: R-transactions
gapStatus: open
affects: [PS-SPP-009]
provenance: {"Impact": {"evidence": "", "source": "proposed"}, "Next step": {"evidence": "", "source": "proposed"}, "The gap": {"evidence": "y and document gap", "source": "elicited"}}
---
## The gap
An outbound recall — initiated by the bank to claw back a payment it has already settled, e.g. after Fraud confirms fraud post-settlement — is in scope ("handling of R-transactions") but documented nowhere. Only the inbound R-transaction was drafted, then removed as out of scope.

## Impact
With no documented outbound-recall path, it is unclear who initiates a recall, on what trigger, through which system and within which scheme deadline. A confirmed post-settlement fraud loss therefore has no defined recovery route in the current-state process.

## Next step
Confirm how the bank initiates an outbound recall today — the trigger, the owning role, the system used and the EPC scheme deadline — and document it as a process step or exception.

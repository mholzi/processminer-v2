---
id: CP-SPP-001
type: control
section: controls
title: IBAN / BIC validation against the scheme directory
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
controlType: PREVENTIVE
execution: AUTOMATED
owner: Payments Operations
step: [PS-SPP-002]
provenance: {"Control activity": {"evidence": "Creditor IBAN structure and check digits are valid. The creditor bank is reachable in the SEPA scheme directory.", "source": "document"}, "Risk addressed": {"evidence": "Y to: tighten it to failed or rejected transfers from a malformed IBAN or an unreachable creditor bank — not misdirection.", "source": "elicited"}, "Timing": {"evidence": "IBAN / BIC validation against the scheme directory | Preventive / automated | Every item", "source": "document"}, "What it checks": {"evidence": "IBAN / BIC validation against the scheme directory", "source": "document"}}
approval: in-progress
---
## What it checks
That the creditor IBAN and BIC are structurally valid and the creditor bank is reachable in the SEPA scheme directory.

## Control activity
The payment hub automatically validates the IBAN structure and check digits and confirms the creditor bank against the scheme directory for every instruction.

## Risk addressed
Without it, an instruction with a malformed IBAN or an unreachable creditor bank could pass into clearing and fail downstream. It does not catch a valid IBAN pointing to the wrong account — that is the beneficiary name check's role.

## Timing
Runs automatically on every payment item at the validate-instruction step.

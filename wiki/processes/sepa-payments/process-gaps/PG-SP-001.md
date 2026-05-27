---
id: PG-SP-001
type: process-gap
section: process-gaps
title: SCT Inst limit ownership unclear
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
area: As-Is process
gapStatus: open
affects: [PS-SP-006]
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:00Z
---
## The gap
The document states the SCT Inst transaction limit is EUR 100,000 but does not clarify whether this is a limit set internally by the bank or the current scheme-level maximum. Without knowing the source of the limit, it is impossible to assess whether the bank could raise or lower it independently, or whether any change requires a scheme rule change.

## Impact
Target-state design cannot determine whether increasing the instant-eligible threshold is within the bank's control. If the limit is the scheme maximum it cannot be raised unilaterally; if it is a bank-set conservative limit, raising it is a prioritisation decision. Ambiguity blocks the routing-decision design in ps-6.

## Next step
Ask the SME (Payments Product Owner) to confirm whether the EUR 100,000 ceiling is the scheme maximum or a bank-imposed sub-limit, and to provide the relevant policy or scheme rule reference.

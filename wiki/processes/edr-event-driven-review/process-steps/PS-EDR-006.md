---
id: PS-EDR-006
type: process-step
section: process-steps
title: Decide further action
status: draft
confidence: high
source: event-driven-review.md
owner: Financial Crime Officer (2LoD)
condition: New risk rating approved
transitions: [PS-EDR-007|normal|always]
provenance: {"Inputs": {"evidence": "Step 6: 'Based on the new rating'; step 2 references 'transaction history, prior alerts, current risk rating' as case context; step 6 lists three options verbatim.", "source": "document"}, "Outputs": {"evidence": "Step 6: 'The decision and rationale are recorded.' Control C-5: 'Audit log of decisions and rationale.' Section 8 identifies Financial Crime Case Management as system of record.", "source": "document"}, "What happens": {"evidence": "Based on the new rating, the Officer decides to retain at standard monitoring, retain at enhanced monitoring, or recommend exit. The decision and rationale are recorded.", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
---
## What happens
Based on the new risk rating, the Financial Crime Officer decides to retain the customer at standard monitoring, retain at enhanced monitoring, or recommend exit. The decision and rationale are recorded.

## Inputs
- Approved risk rating
- EDR case history
- Decision options: retain at standard monitoring / retain at enhanced monitoring / recommend exit

## Outputs
- Decision recorded (retain standard / retain enhanced / recommend exit)
- Rationale documented in the case management system

## Why it matters
Ensures every EDR results in a documented, accountable decision on the customer relationship, closing the loop on the triggering event.

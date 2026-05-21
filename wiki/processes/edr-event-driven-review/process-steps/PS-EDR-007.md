---
id: PS-EDR-007
type: process-step
section: process-steps
title: Close the case
status: draft
confidence: high
source: event-driven-review.md
owner: Financial Crime Analyst (1LoD)
condition: Further action decision has been recorded
systems: [SYS-EDR-001, SYS-EDR-004, SYS-EDR-005]
provenance: {"Inputs": {"evidence": "Step 7: 'the decision, the refreshed KYC pack, the new risk rating, and the next review date.' Section 8 key outputs confirms these four items.", "source": "document"}, "Outputs": {"evidence": "Step 7 and Section 8: KYC Repository and Customer Master listed as systems; step 7: 'The customer is notified only where the bank is taking customer-facing action.'", "source": "document"}, "What happens": {"evidence": "The case is closed with the decision, the refreshed KYC pack, the new risk rating, and the next review date. The customer is notified only where the bank is taking customer-facing action.", "source": "document"}, "Why it matters": {"evidence": "Control C-5: 'Audit log of decisions and rationale.' Section 8 lists KYC Repository as a system in the process.", "source": "document"}}
---
## What happens
The case is closed with the decision, the refreshed KYC pack, the new risk rating, and the next review date recorded in the case-management system. The customer is notified only where the bank is taking customer-facing action.

## Inputs
- Recorded decision and rationale
- Refreshed KYC pack
- New risk rating
- Next review date

## Outputs
- Closed EDR case
- Updated KYC repository
- Updated risk rating in Customer Master
- Customer notification (where applicable)

## Why it matters
Ensures every EDR is fully documented and the KYC repository is updated, maintaining a complete audit trail for regulatory review.

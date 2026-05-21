---
id: PS-EDR-004
type: process-step
section: process-steps
title: Re-screen the customer
status: draft
confidence: high
source: event-driven-review.md
owner: Financial Crime Analyst (1LoD)
condition: CDD data has been updated
transitions: [PS-EDR-005|branch|no true sanctions hit confirmed]
systems: [SYS-EDR-003]
provenance: {"Inputs": {"evidence": "the customer and beneficial owners are re-run through sanctions, PEP, and adverse-media screening", "source": "document"}, "Outputs": {"evidence": "Hits are dispositioned. If a true sanctions hit is found → freeze the relationship and hand to PRC-AML-0420 (Suspicious Activity Reporting).", "source": "document"}, "What happens": {"evidence": "Once the data is updated the customer and beneficial owners are re-run through sanctions, PEP, and adverse-media screening. Hits are dispositioned. If a true sanctions hit is found → freeze the relationship and hand to PRC-AML-0420 (Suspicious Activity Reporting).", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
---
## What happens
Once the CDD data is updated, the customer and beneficial owners are re-run through sanctions, PEP, and adverse-media screening. Screening hits are dispositioned. If a true sanctions hit is confirmed, the relationship is frozen and the case is handed to PRC-AML-0420 (Suspicious Activity Reporting).

## Inputs
- Updated customer CDD data
- Beneficial owner details
- Sanctions, PEP, and adverse-media databases

## Outputs
- Screening results for customer and beneficial owners
- Dispositioned hits
- Sanctions freeze (if applicable)

## Why it matters
Confirms no new sanctions, PEP or adverse media exposure exists before the risk rating is reassessed, preventing high-risk individuals from going undetected.

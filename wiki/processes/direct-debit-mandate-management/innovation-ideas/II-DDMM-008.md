---
id: II-DDMM-008
type: innovation-idea
section: innovation-ideas
title: In-Portal Mandate Query Channel
status: draft
confidence: high
source: ddmm-innovation-analyst
category: Customer Experience
strategicFit: HIGH
complexity: LOW
addresses: [FP-DDMM-005, FP-DDMM-003]
fromTrend: [TR-DDMM-004]
provenance: {"Expected benefit": {"evidence": "SME confirmed: eliminates two-hand-off RM relay; gives creditors a direct, auditable channel tied to the specific mandate; reduces status-chasing contact.", "source": "elicited"}, "Feasibility": {"evidence": "SME confirmed: portal query UI routes into MMS work queue using existing MMS-to-portal path; dependency on Payments Operations to agree SLA and query scope before build.", "source": "elicited"}, "The idea": {"evidence": "SME (M. Vogel) confirmed: FP-DDMM-005 (no direct support line) and FP-DDMM-003 (opaque status) are uncovered by existing ideas; an in-portal query channel addresses both without requiring a new communication medium.", "source": "elicited"}}
---
## The idea
Add a raise-a-query action in the Creditor Portal on each mandate record, allowing the creditor to submit a structured question directly into the Payments Operations work queue — skipping RM relay entirely. Payments Operations responds within the portal; both query and response are visible in the mandate's activity log.

## Expected benefit
Eliminates the two-hand-off relay that multiplies query response latency and gives creditors a direct, auditable communication channel tied to the specific mandate. Reduces status-chasing RM contact by providing an in-portal escalation path that also surfaces processing progress.

## Feasibility
Requires a portal query UI, routing into the MMS work queue, and a response push back to the creditor via the existing MMS-to-portal integration. Dependency: Payments Operations must agree on query-response SLA and the scope of query types before build begins.

---
id: PG-BGIT-005
type: process-gap
section: process-gaps
title: Email-based Legal handoff produces no audit trail and no SLA enforcement
status: draft
confidence: high
source: process-specialist — M. Berger, 2026-05-20
area: As-Is process
gapStatus: open
affects: [PS-BGIT-003]
provenance: {"Impact": {"evidence": "", "source": "proposed"}, "Next step": {"evidence": "M. Berger Stage 5 standing input confirmed gapStatus open", "source": "elicited"}, "The gap": {"evidence": "M. Berger Stage 5: 'Email-based Legal handoff at Step 3 produces no audit trail and no SLA enforcement'", "source": "elicited"}}
---
## The gap
Bespoke-wording applications are routed to Legal via unstructured email rather than a system workflow. No formal SLA governs the Legal review turnaround, and no compliance-facing audit trail records when the request was sent, when Legal responded, or what wording was reviewed.

## Impact
The absence of an audit trail is documented in OAF-BGIT-002. Without SLA enforcement, client commercial deadlines can be missed silently and post-fact reconstruction of the Legal review timeline is impossible, compounding the compliance-documentation dimension of PG-BGIT-002 and PG-BGIT-003.

## Next step
Route Legal reviews through the Trade Finance System workflow module, capturing timestamps for request and response, and enforce the agreed Legal SLA via system alerts to the process owner on breach.

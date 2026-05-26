---
id: TD-BGID-001
type: transformation-decision
section: transformation-decisions
title: ICC-SWIFT API Channel for ERP-Connected Corporate Clients
status: draft
confidence: high
source: SME interview — transformation-agent session 2026-05-26
decisionType: channel strategy
decisionStatus: agreed
resolves: [PP-BGID-003, CG-BGID-001, FP-BGID-004]
realises: [TS-BGID-001, TS-BGID-006]
fromIdea: [II-BGID-004]
provenance: {"Options considered": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}, "Rationale": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}, "The decision": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}}
updatedBy: admin
updatedAt: 2026-05-26T09:27:02Z
---
## The decision
The bank will build an ICC-SWIFT-compliant API channel enabling ERP-connected corporate clients to submit guarantee applications programmatically and receive the MT760 instrument and SWIFT acknowledgement back into their ERP, without portal access.

## Options considered
- **API channel (ICC-SWIFT compliant)** — chosen: connects to ERP at source; eliminates unvalidated portal submissions; positions bank for standardised multi-bank trade flows aligned with TR-BGID-002 and TR-BGID-005
- **Enhanced portal only** — simpler build but does not serve ERP-native clients; misses the market shift to programmatic trade finance
- **SWIFT MT-798 only** — narrower than full API; does not support structured application data, mandatory field validation, or real-time status
- **No API — retain portal-only** — perpetuates the completeness gap and the MT760 delivery confirmation gap with no improvement path

## Rationale
The ICC-SWIFT API standard is already adopted by leading global banks and aligns with the MLETR and eIDAS 2.0 trends (TR-BGID-002, TR-BGID-005). Structured API submission enforces mandatory fields at source — closing CG-BGID-001 on the API path — and the MT760 acknowledgement loop closes FP-BGID-004.

---
id: TS-DDMM-006
type: target-state
section: to-be-design
title: Continuous Sanctions and Regulatory Compliance
status: draft
confidence: high
source: ddmm-transformation-agent
replaces: [PS-DDMM-002, PS-DDMM-003]
systems: [SYS-DDMM-002, SYS-DDMM-004]
risks: [IR-DDMM-007]
provenance: {"Rationale": {"evidence": "SME confirmed: CG-DDMM-002, CG-DDMM-004, PG-DDMM-006 are live obligations; framing accepted without edit.", "source": "elicited"}, "Target description": {"evidence": "SME (M. Vogel) confirmed: accurate; closes CG-DDMM-002, CG-DDMM-004, PG-DDMM-004 and PG-DDMM-006; correctly sequences regulatory closure ahead of second-wave AI augmentation. Trim is formatting-only.", "source": "elicited"}, "What changes": {"evidence": "SME confirmed all five change bullets — accepted without edit.", "source": "elicited"}}
---
## Target description
Sanctions screening is extended beyond mandate registration: IBAN amendments and cancellations are assessed against the same screening obligation as new registrations, closing PG-DDMM-006. The active mandate register is re-screened periodically on a Compliance-defined schedule, closing CG-DDMM-004. A formal scheme-compliance opinion is obtained on IBAN amendment treatment under SEPA SDD rules; the procedure is updated to require a new UMR if required, closing CG-DDMM-002 and PG-DDMM-004. Second-wave: an AI-assisted context pack is introduced for sanctions triage, preserving officer judgement.

## What changes
- Sanctions screening triggered for IBAN amendments and cancellations, not only new registrations (PG-DDMM-006 closed)
- Periodic re-screening of active mandate register on Compliance-defined schedule and ownership (CG-DDMM-004 closed)
- Formal SEPA SDD scheme-compliance opinion obtained on IBAN amendment treatment (CG-DDMM-002 closed)
- IBAN amendment procedure updated: new UMR required if scheme rules demand it (PG-DDMM-004 closed)
- Second-wave: AI context pack for sanctions triage surfaced to Compliance Officer in MMS (IR-DDMM-007 managed by design)

## Rationale
CG-DDMM-002, CG-DDMM-004, and PG-DDMM-006 are live regulatory obligations — not future improvements. Each is a known gap in point-in-time screening coverage. The target closes all three with defined process and system change before any second-wave AI augmentation is introduced.

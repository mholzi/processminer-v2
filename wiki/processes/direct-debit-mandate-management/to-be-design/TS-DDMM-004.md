---
id: TS-DDMM-004
type: target-state
section: to-be-design
title: Risk-Proportionate Dual-Control with Certified Checker Pool
status: draft
confidence: high
source: ddmm-transformation-agent
replaces: [PS-DDMM-004]
systems: [SYS-DDMM-002]
risks: [IR-DDMM-001, IR-DDMM-005]
provenance: {"Rationale": {"evidence": "SME confirmed: PP-DDMM-002 and CG-DDMM-003 share a root cause; framing accepted without edit.", "source": "elicited"}, "Target description": {"evidence": "SME (M. Vogel) confirmed: accurate; closes CG-DDMM-003 and PG-DDMM-005, requires Compliance sign-off on scoring model, carries IR-DDMM-001/005 risks; accepted without edit. Trim is formatting-only.", "source": "elicited"}, "What changes": {"evidence": "SME confirmed all six change bullets — accepted without edit.", "source": "elicited"}}
---
## Target description
The fixed 50-mandate batch threshold is replaced by a risk-based routing model in MMS. Each batch is scored by total value, creditor risk tier, and request type and assigned to one of two tracks: full dual-control or risk-proportionate spot-check. A lighter certification track broadens the eligible reviewer pool, removing the single-Checker dependency. Single-mandate registrations are assessed by the same model; four-eyes is applied to high-risk singles, closing CG-DDMM-003. Compliance formally approves scoring criteria before go-live; boundary changes require re-approval.

## What changes
- Fixed 50-mandate threshold replaced by MMS risk-scoring per batch (value, creditor tier, request type)
- Two review tracks established: full dual-control and risk-proportionate spot-check
- Lighter certification track created and staffed for routine spot-check work, broadening the Checker pool
- Single-mandate registrations assessed via the same risk model; four-eyes applied on high-risk singles (CG-DDMM-003 closed)
- Compliance formally approves scoring criteria; threshold changes require re-approval
- Dual-control rejection correction procedure documented in DTP (PG-DDMM-005 closed)

## Rationale
PP-DDMM-002 (bottleneck) and CG-DDMM-003 (no four-eyes on singles) share a root cause — a single undifferentiated control applied uniformly regardless of risk. Risk-proportionate routing resolves both: the control is stronger where risk is highest and lighter where it is not.

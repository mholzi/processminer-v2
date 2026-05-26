---
id: TS-BGID-005
type: target-state
section: to-be-design
title: Issuance Approval — No Change in Target State
status: draft
confidence: high
source: SME interview — transformation-agent session 2026-05-26
replaces: [PS-BGID-005]
systems: [SYS-BGID-002]
provenance: {"Rationale": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}, "Target description": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}, "What changes": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}}
updatedBy: admin
updatedAt: 2026-05-26T09:27:02Z
---
## Target description
The four-eyes issuance approval step is unchanged in the target state. Dual-authorisation is a regulatory requirement under MaRisk BTO 1.2 and EBA/GL/2021/05, enforced by the Trade Finance System. The automated portal notification to the client on approval (JT-BGID-004) is already delivered by the current TFS integration. No change is planned.

## What changes
- No structural change — the four-eyes approval gate and its TFS enforcement are retained in the target state
- The automated client notification triggered at approval is already in place and requires no modification

## Rationale
Four-eyes approval is mandated by MaRisk BTO 1.2 and enforced by the TFS; no innovation idea proposes an alternative within the current regulatory environment and no documented problem targets this step.

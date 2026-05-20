---
id: VG-BGIT-001
type: gap
section: gap-resolution
title: No ICC-SWIFT API gateway in current Trade Finance System
status: draft
confidence: high
source: source-target — bank-guarantee-issuance-test wiki
validationArea: IT Architecture
gapStatus: open
provenance: {"Resolution": {"evidence": "M. Berger Stage 5 refinement session, 2026-05-20 — confirmed gap-resolution from source-target stub", "source": "elicited"}, "Status": {"evidence": "M. Berger Stage 5 refinement session, 2026-05-20 — confirmed gap-resolution from source-target stub", "source": "elicited"}, "The gap": {"evidence": "M. Berger Stage 5 refinement session, 2026-05-20 — confirmed gap-resolution from source-target stub", "source": "elicited"}}
---
## The gap
The current Trade Finance System has no ICC-SWIFT C2B API gateway. Integrating the standard requires a TFS platform extension or middleware layer before API intake can go live, and no such capability has been scoped.

## Resolution
Procure or build an ICC-SWIFT-aligned API gateway — using a vendor such as Komgo Konsole, Surecomp RIVO or equivalent — and integrate it with TFS. A dual-channel operating model (API for connected clients, portal for others) allows phased rollout without service disruption. The gateway must map ICC-SWIFT message fields to all mandatory TFS intake fields.

## Status
Open — no procurement or design has started. IT scoping is required before TD-BGIT-001 can be scheduled.

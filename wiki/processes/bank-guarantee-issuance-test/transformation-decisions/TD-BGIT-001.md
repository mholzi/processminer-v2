---
id: TD-BGIT-001
type: transformation-decision
section: transformation-decisions
title: Adopt ICC-SWIFT C2B API standard for structured corporate guarantee intake
status: draft
confidence: high
source: source-target — bank-guarantee-issuance-test wiki
decisionType: build/buy
decisionStatus: agreed
resolves: [PP-BGIT-003, CG-BGIT-001, PG-BGIT-002]
realises: [TS-BGIT-001]
fromIdea: [II-BGIT-001]
provenance: {"Options considered": {"evidence": "M. Berger Stage 5 refinement session, 2026-05-20 — confirmed transformation decision from source-target stub", "source": "elicited"}, "Rationale": {"evidence": "M. Berger Stage 5 refinement session, 2026-05-20 — confirmed transformation decision from source-target stub", "source": "elicited"}, "The decision": {"evidence": "M. Berger Stage 5 refinement session, 2026-05-20 — confirmed transformation decision from source-target stub", "source": "elicited"}}
---
## The decision
Adopt the ICC-SWIFT C2B API standard for receiving corporate guarantee instructions, integrating an API gateway into the Trade Finance System alongside the existing Corporate Portal, with the portal retained for clients not yet on the standard.

## Options considered
- Adopt ICC-SWIFT C2B API standard with portal retained in parallel for non-connected clients
- Enhance the existing portal with mandatory structured form fields only, without API investment
- Build a proprietary API without adopting the industry standard
- Defer digital intake investment and address completeness through procedural controls alone

## Rationale
The ICC-SWIFT standard is production-proven (seven banks live as of January 2026) and vendor-supported by Komgo and Surecomp. Adopting the standard preserves interoperability with multi-bank platforms, avoids proprietary lock-in, and aligns with the industry trajectory. A parallel portal channel ensures no disruption to clients not yet on the standard.

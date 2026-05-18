---
id: VG-COB-001
type: gap
section: gap-resolution
title: No integration layer across the legacy systems
status: draft
confidence: low
source: Consolidated by source-target from the COB-003 wiki
validationArea: Technology Architecture
gapStatus: open
provenance: {"Resolution": {"evidence": "", "source": "proposed"}, "Status": {"evidence": "", "source": "proposed"}, "The gap": {"evidence": "", "source": "proposed"}}
---
## The gap
Onboarding runs across six-plus systems that were added over time with no integration layer or shared case view. The unified workspace target assumes an orchestration layer the bank does not currently have.

## Resolution
The transformation must deliver an integration layer — built or bought — that lets the systems exchange data and present one case view. This is the foundational capability behind target state TS-COB-002, and the SLA instrumentation and continuous monitoring both depend on it being in place first.

## Status
Open — no integration capability exists today; the build-versus-buy choice in TD-COB-001 must be settled before this gap can close.

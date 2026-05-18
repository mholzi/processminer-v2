---
id: VG-COB-003
type: gap
section: gap-resolution
title: No explainability and audit layer for automated decisions
status: draft
confidence: low
source: Consolidated by source-target from the COB-003 wiki
validationArea: Risk and Compliance
gapStatus: open
provenance: {"Resolution": {"evidence": "", "source": "proposed"}, "Status": {"evidence": "", "source": "proposed"}, "The gap": {"evidence": "", "source": "proposed"}}
---
## The gap
AI-assisted screening and open-banking credit decisioning introduce automated risk decisions, but the bank has no explainability and audit layer to evidence how those decisions are reached — which regulators now require.

## Resolution
The transformation must build model-explainability, decision-logging and audit-trail capability alongside the AI screening and open-banking credit changes, so every automated or AI-assisted decision can be reconstructed and defended. Target state TS-COB-003 cannot be approved for production without it.

## Status
Open — the explainability layer is a named dependency of TD-COB-004 and TD-COB-005 but is not yet scoped.

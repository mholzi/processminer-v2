---
id: VG-FR-001
type: gap
section: gap-resolution
title: Funding and limit assurance is point-in-time
status: draft
confidence: medium
source: SME interview - M. Berger
validationArea: Liquidity
gapStatus: addressed-in-target
---
## The gap
Treasury's funding confirmation and the facility-limit check are both point-in-time: neither reserves anything, so confirmed funding can be consumed and concurrent releases can over-draw a facility (PP-FR-001, CG-FR-004, CG-FR-002). The Treasury confirmation is also manually re-keyed between systems (PG-FR-008).

## Resolution
TS-FR-001 makes the liquidity step a true reservation — confirmed funding and facility-limit headroom are ring-fenced on approval and held until execution, and the Treasury confirmation flows automatically into the workflow item with no re-key. A defined release-or-restore rule frees reservations cleanly.

## Status
Designed in the target state (TS-FR-001); not yet built. Depends on activating the SYS-FR-004 earmark capability and a SYS-FR-001 integration.

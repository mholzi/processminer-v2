---
id: TS-FR-001
type: target-state
section: to-be-design
title: Liquidity confirmation as a true reservation
status: draft
confidence: medium
source: SME interview - M. Berger
replaces: [PS-FR-005]
systems: [SYS-FR-001, SYS-FR-004, SYS-FR-005]
risks: [IR-FR-002]
---
## Target description
At the liquidity step, Treasury's funding confirmation becomes a genuine reservation rather than a point-in-time check. When a release at or above the threshold is approved, the confirmed funding and the facility-limit headroom are both ring-fenced against the named release and held until execution posts it. The confirmation flows automatically from the Treasury liquidity platform into the workflow item, with no manual re-key, and a defined release-or-restore rule frees the reservation when an item is cancelled, rejected or times out.

## What changes
- Treasury-confirmed funding is earmarked against the named release and held until PS-FR-007 posts it
- The facility limit is decremented on approval and re-checked at execution, not read once at validation
- The funding confirmation flows automatically from SYS-FR-004 into the workflow item, replacing Treasury's manual re-key
- A defined release-or-restore rule frees reservations for cancelled, rejected or stalled items

## Rationale
A confirmation that does not reserve gives assurance it cannot keep — large releases that passed liquidity confirmation still fail at execution. Reserving funding and limit on approval makes the control's assurance hold to the point of release and stops concurrent releases starving or over-drawing each other.

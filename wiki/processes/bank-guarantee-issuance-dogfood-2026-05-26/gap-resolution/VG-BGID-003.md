---
id: VG-BGID-003
type: gap
section: gap-resolution
title: TFS Milestone Events Not Exposed to the Corporate Portal
status: draft
confidence: low
source: wiki-synthesis-2026-05-26
validationArea: client experience
gapStatus: open
updatedBy: admin
updatedAt: 2026-05-26T20:15:01Z
---
## The gap
The Trade Finance System records application status events but does not expose them via an API or feed to the Corporate Portal, leaving clients with no real-time visibility into their application's progress.

## Resolution
Build a TFS milestone-event API and consume it in the Corporate Portal to display live milestones to clients, as described in target state TS-3. The same API should serve the push-notification capability planned for the client visibility theme.

## Status
Open. The TFS milestone API is the prerequisite for target state TS-3 and must be scoped in the platform enhancement phase.

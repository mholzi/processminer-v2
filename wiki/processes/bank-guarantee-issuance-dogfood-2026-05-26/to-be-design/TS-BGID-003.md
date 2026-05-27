---
id: TS-BGID-003
type: target-state
section: to-be-design
title: Client Transparency and Real-Time Visibility
status: draft
confidence: low
source: wiki-synthesis-2026-05-26
replaces: []
systems: [SYS-BGID-001, SYS-BGID-002]
risks: []
updatedBy: admin
updatedAt: 2026-05-26T20:15:01Z
---
## Target description
Every guarantee application exposes its current processing milestone — intake accepted, credit approved, wording cleared, screening passed, approval recorded, SWIFT delivered — in the Corporate Portal with timestamps and the responsible function at each stage. Clients and relationship managers self-serve status questions without contacting the bank, reducing inbound calls and closing the transparency gap identified in the CGI 2025 benchmark.

## What changes
- The Corporate Portal displays live application milestones drawn from Trade Finance System status events.
- Each milestone is timestamped and labelled with the responsible function (e.g. Credit, Legal, Compliance).
- Clients receive push notifications at the issuance approval and SWIFT delivery milestones.
- Inbound relationship-manager calls for status updates are reduced by enabling client self-service in the portal.

## Rationale
83% of corporate clients rate real-time visibility as high value but most banks do not provide it. Exposing milestones in the existing portal directly closes this gap with minimal new infrastructure.

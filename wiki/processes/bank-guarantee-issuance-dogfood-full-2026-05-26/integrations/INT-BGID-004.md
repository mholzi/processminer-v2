---
id: INT-BGID-004
type: integration
section: integrations
title: Trade Finance System and Facility/Credit System — Headroom Check and Utilisation Update
status: draft
confidence: medium
source: it-architect session 2026-05-26
systems: [SYS-BGID-002, SYS-BGID-005]
provenance: {"What connects": {"evidence": "Elicited: bi-directional REST, sync read/async write, eventually-consistent, 1 business day lag, PS-BGID-002 and PS-BGID-007", "source": "elicited"}, "What flows": {"evidence": "Elicited: headroom query, available headroom response, post-issuance utilisation write", "source": "elicited"}}
updatedBy: admin
updatedAt: 2026-05-26T10:09:43Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## What connects
Bi-directional integration between the Trade Finance System (SYS-BGID-002) and the Facility/Credit System (SYS-BGID-005). Read: synchronous REST; write: async, eventually-consistent; typical update lag: 1 business day.

## What flows
- Facility headroom query (client ID, requested guarantee amount) read synchronously at PS-BGID-002
- Available headroom and facility limit returned to TFS
- Post-issuance utilisation update written asynchronously at PS-BGID-007; eventual consistency lag documented in EX-BGID-006

---
id: TD-BGID-001
type: transformation-decision
section: transformation-decisions
title: Deploy same-day fast-lane routing via Corporate Portal and TFS
status: draft
confidence: low
source: wiki-synthesis-2026-05-26
decisionType: process redesign
decisionStatus: proposed
resolves: [PP-BGID-001, PP-BGID-003, CG-BGID-001]
realises: [TS-BGID-001]
fromIdea: [II-BGID-001]
updatedBy: admin
updatedAt: 2026-05-26T20:15:01Z
---
## The decision
Enhance the Corporate Portal to validate required application fields and check real-time facility headroom at submission, then configure a TFS routing rule that advances qualifying applications — in-facility, standard-wording, no screening hit — directly to sanctions screening and issuance approval.

## Options considered
- Automated portal validation plus TFS routing rule reusing existing infrastructure (chosen).
- Dedicated straight-through processing middleware platform between portal and TFS.
- Maintain the current manual officer check for all applications with no automation.

## Rationale
The portal and TFS are already integrated; enhancing them for validation and auto-routing reuses existing infrastructure without a new platform investment. It removes the two most common delay sources for qualifying cases while all risk controls remain in place.

---
id: II-FR-002
type: innovation-idea
section: innovation-ideas
title: Automate the Treasury confirmation feed
status: draft
confidence: medium
source: source-innovation web research
category: Integration
strategicFit: HIGH
complexity: MEDIUM
addresses: [PG-FR-008, PG-FR-007]
fromTrend: [TR-FR-005]
fromCompetitor: [CFT-FR-001]
---
## The idea
Build a system integration between the Treasury liquidity platform and the payments workflow tool so the funding confirmation flows automatically into the workflow item, replacing Treasury's manual re-key of the 'confirmed' flag.

## Expected benefit
Removing the manual re-key closes the error path where a release proceeds without a genuine confirmation or a confirmed one is blocked, and gives the release a documented, auditable integration between the two systems.

## Feasibility
A point-to-point interface between two existing systems — moderate build effort; depends on an available API or message feed on SYS-FR-004 and on documenting the integration in the IT architecture pass.

---
id: II-FR-001
type: innovation-idea
section: innovation-ideas
title: Reserve-on-approval
status: draft
confidence: medium
source: source-innovation web research
category: Liquidity
strategicFit: HIGH
complexity: MEDIUM
addresses: [PP-FR-001, CG-FR-004, CG-FR-002]
fromTrend: [TR-FR-003]
fromCompetitor: [CFT-FR-003]
---
## The idea
Reserve funding and facility-limit headroom the moment a release is approved, not just checking them point-in-time. Ring-fence Treasury-confirmed funding against the named release at PS-FR-005 and hold it until PS-FR-007 posts; and decrement the facility limit on approval, re-checked at execution. One reservation discipline closes both the funding-earmark and limit-check gaps.

## Expected benefit
A release that passes funding confirmation can no longer be starved by another release, and concurrent releases can no longer jointly over-draw a facility — so large releases stop failing at execution (EX-FR-005) and unauthorised credit exposure is prevented.

## Feasibility
The earmark capability already exists unused in SYS-FR-004, so funding reservation is configuration over new build; the limit decrement needs a change to CP-FR-001 and a release-or-restore rule for cancelled and rejected items. Depends on Treasury and Facility Management procedure updates.

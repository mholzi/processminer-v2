---
id: II-BGIT-003
type: innovation-idea
section: innovation-ideas
title: Real-time credit limit pre-check at application intake
status: draft
confidence: medium
category: automation
strategicFit: HIGH
complexity: LOW
addresses: [PP-BGIT-001, PG-BGIT-001]
fromTrend: [TR-BGIT-002]
fromCompetitor: [CGL-BGIT-001]
---
## The idea
Surface the client's current facility utilisation and available headroom on the Corporate Portal at the point of application submission — via a real-time read-only TFS query — so clients see before submitting whether their current limit will trigger a Credit team referral.

## Expected benefit
Reduces credit limit stalls at Step 2 (PP-BGIT-001) by prompting clients to pre-arrange limit before applying, cutting Credit team referrals — the most common source of end-to-end delay and the root cause of PG-BGIT-001.

## Feasibility
Requires only a read-only Corporate Portal → TFS API query at intake; the data already exists in TFS. LOW complexity — no process redesign, only a portal UI change and a lightweight API endpoint.

---
id: TS-COB-003
type: target-state
section: to-be-design
title: Data-driven risk and credit decisioning
status: draft
confidence: low
source: Consolidated by source-target from the COB-003 wiki
replaces: [PS-COB-002, PS-COB-003]
systems: [SYS-COB-003, SYS-COB-004, SYS-COB-006]
provenance: {"Rationale": {"evidence": "", "source": "proposed"}, "Target description": {"evidence": "", "source": "proposed"}, "What changes": {"evidence": "", "source": "proposed"}}
---
## Target description
KYC screening and credit assessment both run on current data and intelligent automation. AI-assisted screening auto-clears low-risk routine alerts and learns from analyst decisions to suppress repeat false matches, while a plain-language assistant guides clients through ownership questions. Credit assessment draws on permissioned open-banking cash-flow data, giving the analyst a live financial picture rather than waiting on a stale, invisible bureau response.

## What changes
- Conservatively-tuned screening thresholds gain an AI learning loop that suppresses repeat false positives
- Routine low-risk alerts are auto-cleared instead of every match going to manual review
- Regulatory ownership questions are translated into plain language with worked examples
- Credit assessment uses live open-banking cash-flow data alongside or instead of the external bureau pull
- The unpredictable, invisible bureau wait is removed from the overdraft decision

## Rationale
The two assessment steps lose time to a 40% false-positive load and an opaque bureau wait. Moving both onto current data and learning automation cuts that waste, improves data quality, and lets analysts spend their time on genuine risk.

---
id: EX-BGID-006
type: exception
section: exceptions
title: Post-Issuance Facility Headroom Update Lag
status: draft
confidence: medium
source: SME interview
category: system sync delay
frequencyPct: 5%
impact: LOW
handlingOwner: Trade Finance Officer
provenance: {"Description": {"evidence": "SME validated — control-compliance-specialist session 2026-05-26", "source": "elicited"}, "Handling": {"evidence": "SME validated — control-compliance-specialist session 2026-05-26", "source": "elicited"}, "Impact": {"evidence": "SME validated — control-compliance-specialist session 2026-05-26", "source": "elicited"}}
updatedBy: admin
updatedAt: 2026-05-26T09:37:44Z
approval: in-progress
approvalBy: admin
approvalDate: 2026-05-26
---
## Description
After a guarantee is issued and the MT760 transmitted, the face value is not reflected as utilised capacity in the facility management system for up to one business day, causing the Corporate Portal to display a higher available headroom than the bank's actual exposure during that window.

## Handling
No manual intervention is required for routine cases; the facility management system's overnight batch update corrects the headroom figure before the following business day. Where a client submits a second guarantee application on the same business day as an earlier issuance, the TFO manually checks the facility system before advancing the application.

## Impact
Low impact in most cases; creates an intraday risk window where a same-day second application could be advanced against headroom already consumed by the earlier issuance, exposing the bank to brief facility over-utilisation.

---
id: TS-BGID-001
type: target-state
section: to-be-design
title: Straight-Through Processing for Standard Guarantees
status: draft
confidence: low
source: wiki-synthesis-2026-05-26
replaces: [PS-BGID-001, PS-BGID-002]
systems: [SYS-BGID-001, SYS-BGID-002]
risks: [IR-BGID-002]
provenance: {"Rationale": {"evidence": "", "source": "proposed"}, "Target description": {"evidence": "", "source": "proposed"}, "What changes": {"evidence": "", "source": "proposed"}}
updatedBy: admin
updatedAt: 2026-05-26T20:15:01Z
---
## Target description
Standard-wording, in-facility guarantee applications move through a same-day fast lane: the Corporate Portal validates all required fields at submission, checks facility headroom in real time against the Trade Finance System, and auto-classifies the wording type. Applications that pass all three gates skip the manual Credit and Facility Check and proceed directly to sanctions screening and issuance approval, replacing the current 3-business-day SLA with a same-day commitment for qualifying cases.

## What changes
- The Corporate Portal validates the commercial contract reference, beneficiary details and wording-type flag before submission is accepted.
- A real-time facility-headroom check at the portal gates under-limit applications to the Credit team automatically, without officer involvement.
- Qualifying applications are routed directly to sanctions screening and approval via a TFS routing rule, bypassing the separate manual Credit and Facility Check step.
- A same-day SLA replaces the 3-business-day target for the estimated 60% of applications that qualify for the fast lane.

## Rationale
Automated facility and completeness checks remove the two most common delay sources for in-policy cases, freeing the officer to focus on exceptions, while keeping the four-eyes approval and sanctions screening controls unchanged.

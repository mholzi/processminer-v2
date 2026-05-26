---
id: DEP-BGID-003
type: process-dependency
section: dependencies
title: Credit team deciding on facility shortfall cases
status: draft
confidence: low
source: wiki-synthesis-2026-05-26
direction: BIDIRECTIONAL
atStep: [PS-BGID-002]
viaSystem: [SYS-BGID-002]
provenance: {"The dependency": {"evidence": "", "source": "proposed"}, "What crosses the boundary": {"evidence": "", "source": "proposed"}, "Why it matters": {"evidence": "", "source": "proposed"}}
updatedBy: admin
updatedAt: 2026-05-26T20:15:01Z
---
## The dependency
When a client's available facility limit is insufficient to cover the requested guarantee amount, the application is routed to the Credit team, which decides on a limit increase or declines before processing can resume.

## What crosses the boundary
An application flagged for insufficient facility is handed to Credit with the request details and current utilisation. Credit returns a facility-increase authorisation or a decline, both of which re-enter the issuance process.

## Why it matters
Credit team response time determines the cycle-time overhead for the most common process exception. Automated portal validation in the target state reduces the volume of cases that reach this exception path.
